import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF141414),
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const R3GroupApp());
}

class R3GroupApp extends StatelessWidget {
  const R3GroupApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'R3 Group',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFC5A059),
          primary: const Color(0xFF141414),
          secondary: const Color(0xFFC5A059),
        ),
        useMaterial3: true,
      ),
      home: const AdminWebViewScreen(),
    );
  }
}

class AdminWebViewScreen extends StatefulWidget {
  const AdminWebViewScreen({super.key});

  @override
  State<AdminWebViewScreen> createState() => _AdminWebViewScreenState();
}

class _AdminWebViewScreenState extends State<AdminWebViewScreen>
    with WidgetsBindingObserver {
  static const String _loginUrl = 'https://r3group.co.in/admin/login';
  static const String _dashboardUrl = 'https://r3group.co.in/admin';
  static const String _tokenKey = 'r3_admin_token';

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  late final WebViewController _controller;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  bool _isInitializing = true;
  bool _isPageLoading = true;
  bool _isOffline = false;
  bool _hasWebError = false;
  String? _persistedToken;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initApp();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _connectivitySub?.cancel();
    super.dispose();
  }

  Future<void> _initApp() async {
    // 1. Restore persisted JWT token from Keychain / Android Keystore
    try {
      _persistedToken = await _secureStorage.read(key: _tokenKey);
    } catch (_) {
      _persistedToken = null;
    }

    // 2. Check initial connectivity
    final results = await Connectivity().checkConnectivity();
    _isOffline = results.every((r) => r == ConnectivityResult.none);

    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (mounted && offline != _isOffline) {
        setState(() => _isOffline = offline);
        if (!offline && (_hasWebError || _isPageLoading)) {
          _retryLoad();
        }
      }
    });

    // 3. Configure WebViewController
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final controller = WebViewController.fromPlatformCreationParams(params);

    await controller.setJavaScriptMode(JavaScriptMode.unrestricted);
    await controller.setBackgroundColor(const Color(0xFFFAF9F6));

    await controller.setNavigationDelegate(
      NavigationDelegate(
        onPageStarted: (url) {
          if (mounted) {
            setState(() {
              _isPageLoading = true;
              _hasWebError = false;
            });
          }
          // Inject persisted token into localStorage as early as possible
          if (_persistedToken != null && _persistedToken!.isNotEmpty) {
            _injectTokenIntoLocalStorage(_persistedToken!);
          }
        },
        onPageFinished: (url) async {
          if (mounted) {
            setState(() {
              _isPageLoading = false;
              _isInitializing = false;
            });
          }
          await _syncTokenFromWebView(url);
        },
        onWebResourceError: (error) {
          if (error.isForMainFrame ?? true) {
            if (mounted) {
              setState(() {
                _hasWebError = true;
                _isPageLoading = false;
                _isInitializing = false;
              });
            }
          }
        },
        onNavigationRequest: (request) async {
          final uri = Uri.tryParse(request.url);
          if (uri == null) return NavigationDecision.prevent;

          // Allow internal R3 Group URLs inside WebView
          final host = uri.host.toLowerCase();
          if ((uri.scheme == 'https' || uri.scheme == 'http') &&
              (host == 'r3group.co.in' || host == 'www.r3group.co.in')) {
            return NavigationDecision.navigate;
          }

          // Open external URLs (tel:, mailto:, whatsapp:, maps, etc.) natively
          await _launchExternalUrl(uri);
          return NavigationDecision.prevent;
        },
      ),
    );

    // JavaScript dialogs (alert, confirm)
    await controller.setOnJavaScriptAlertDialog((request) async {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('R3 Group'),
          content: Text(request.message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    });

    await controller.setOnJavaScriptConfirmDialog((request) async {
      if (!mounted) return false;
      final result = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Confirm'),
          content: Text(request.message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return result ?? false;
    });

    // Android-specific file upload & DOM storage configuration
    if (controller.platform is AndroidWebViewController) {
      final androidController =
          controller.platform as AndroidWebViewController;
      await androidController.setMediaPlaybackRequiresUserGesture(false);
      await androidController.setOnShowFileSelector(_handleAndroidFileUpload);
    }

    _controller = controller;

    final initialUrl =
        (_persistedToken != null && _persistedToken!.isNotEmpty)
            ? _dashboardUrl
            : _loginUrl;

    if (!_isOffline) {
      await _controller.loadRequest(Uri.parse(initialUrl));
    } else if (mounted) {
      setState(() => _isInitializing = false);
    }
  }

  Future<List<String>> _handleAndroidFileUpload(
    FileSelectorParams params,
  ) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: params.mode == FileSelectorMode.openMultiple,
        type: FileType.any,
      );
      if (result == null) return [];
      return result.files
          .where((f) => f.path != null)
          .map((f) => Uri.file(f.path!).toString())
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _injectTokenIntoLocalStorage(String token) async {
    try {
      final escaped = token.replaceAll("'", "\\'");
      await _controller.runJavaScript(
        "if (!localStorage.getItem('$_tokenKey')) { localStorage.setItem('$_tokenKey', '$escaped'); }",
      );
    } catch (_) {}
  }

  /// Syncs JWT token between WebView localStorage and native secure storage.
  Future<void> _syncTokenFromWebView(String currentUrl) async {
    try {
      final raw = await _controller.runJavaScriptReturningResult(
        "localStorage.getItem('$_tokenKey')",
      );
      final tokenStr = raw.toString().replaceAll('"', '').trim();
      final hasToken =
          tokenStr.isNotEmpty && tokenStr != 'null' && tokenStr != 'undefined';

      if (hasToken && tokenStr != _persistedToken) {
        _persistedToken = tokenStr;
        await _secureStorage.write(key: _tokenKey, value: tokenStr);
      } else if (!hasToken && _persistedToken != null) {
        // User logged out or session was cleared in web app
        _persistedToken = null;
        await _secureStorage.delete(key: _tokenKey);
      }
    } catch (_) {}
  }

  Future<void> _launchExternalUrl(Uri uri) async {
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  Future<void> _retryLoad() async {
    setState(() {
      _hasWebError = false;
      _isPageLoading = true;
    });
    final target = (_persistedToken != null && _persistedToken!.isNotEmpty)
        ? _dashboardUrl
        : _loginUrl;
    await _controller.loadRequest(Uri.parse(target));
  }

  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    if (!mounted) return true;
    final shouldExit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Exit R3 Group?'),
        content: const Text('Do you want to close the application?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Exit'),
          ),
        ],
      ),
    );
    return shouldExit ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final exit = await _onWillPop();
        if (exit && context.mounted) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF141414),
        body: SafeArea(
          child: Stack(
            children: [
              if (!_isOffline && !_hasWebError && !_isInitializing)
                WebViewWidget(controller: _controller),

              if (_isOffline || _hasWebError)
                _OfflineErrorView(
                  isOffline: _isOffline,
                  onRetry: _retryLoad,
                ),

              if (_isPageLoading && !_isOffline && !_hasWebError && !_isInitializing)
                const Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    minHeight: 3,
                    color: Color(0xFFC5A059),
                    backgroundColor: Colors.transparent,
                  ),
                ),

              if (_isInitializing) const _SplashView(),
            ],
          ),
        ),
      ),
    );
  }
}

class _SplashView extends StatelessWidget {
  const _SplashView();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF141414),
      width: double.infinity,
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'R3 GROUP',
            style: TextStyle(
              color: Color(0xFFC5A059),
              fontSize: 28,
              fontWeight: FontWeight.bold,
              letterSpacing: 4,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'ADMIN PORTAL',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              letterSpacing: 2,
            ),
          ),
          SizedBox(height: 28),
          CircularProgressIndicator(
            color: Color(0xFFC5A059),
            strokeWidth: 2.5,
          ),
        ],
      ),
    );
  }
}

class _OfflineErrorView extends StatelessWidget {
  const _OfflineErrorView({
    required this.isOffline,
    required this.onRetry,
  });

  final bool isOffline;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFFAF9F6),
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isOffline ? Icons.wifi_off_rounded : Icons.error_outline_rounded,
            size: 56,
            color: const Color(0xFFC5A059),
          ),
          const SizedBox(height: 16),
          Text(
            isOffline ? 'No Internet Connection' : 'Unable to Load Page',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF141414),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isOffline
                ? 'Please check your network connection and try again.'
                : 'Something went wrong while loading the R3 Group Admin Portal.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF141414),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
