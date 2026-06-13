package com.lamovie.tvapp

import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var fullscreenContainer: FrameLayout

    // Variables para el manejo de reproducción de video en pantalla completa
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Inicializar vistas
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        fullscreenContainer = findViewById(R.id.fullscreenContainer)

        // Configurar WebView
        setupWebView()

        // Configurar el callback de retroceso (Back Button)
        setupBackPressed()
    }

    private fun setupWebView() {
        val settings = webView.settings

        // Habilitar soporte de JavaScript y almacenamiento DOM (necesario para React SPA)
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        
        // Permitir que los reproductores de video se inicien sin requerir gestos táctiles del usuario
        settings.mediaPlaybackRequiresUserGesture = false

        // Ajustar contenido al tamaño de la pantalla
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Forzar cookies en el WebView
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        // User Agent optimizado para TV (basado en Google TV / Chrome)
        // Esto le indica a los reproductores y reproductores externos que estamos en un entorno TV
        settings.userAgentString = "Mozilla/5.0 (Linux; GoogleTV; Chromecast) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"

        // Permitir carga de recursos mixtos (HTTP y HTTPS) ya que algunos streams de video externos usan HTTP
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // Asegurar que el WebView y sus subcomponentes puedan recibir foco
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.requestFocus()

        // Asignar clientes personalizados
        webView.webViewClient = MyWebViewClient()
        webView.webChromeClient = MyWebChromeClient()

        // Cargar sitio web oficial
        webView.loadUrl("https://lamovie.org/")
    }

    // Manejar el botón de retroceso nativo (mando de TV o control)
    private fun setupBackPressed() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // 1. Si hay un video en pantalla completa, salir del modo pantalla completa primero
                if (customView != null) {
                    hideFullscreenView()
                } 
                // 2. Si el WebView puede retroceder en el historial de la web, retroceder
                else if (webView.canGoBack()) {
                    webView.goBack()
                } 
                // 3. De lo contrario, cerrar la aplicación
                else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    // Salir del modo de video a pantalla completa y retornar al WebView
    private fun hideFullscreenView() {
        val cv = customView ?: return
        val callback = customViewCallback ?: return

        // Ocultar el contenedor de pantalla completa
        fullscreenContainer.visibility = View.GONE
        fullscreenContainer.removeView(cv)
        customView = null
        customViewCallback = null

        // Mostrar de nuevo el WebView principal
        webView.visibility = View.VISIBLE
        webView.requestFocus()

        // Notificar al sistema web que se cerró la vista personalizada
        callback.onCustomViewHidden()

        // Restaurar barra de estado / navegación
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
    }

    // Cliente WebView para controlar la carga de páginas e inyectar JavaScript
    private inner class MyWebViewClient : WebViewClient() {

        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
            // Permitimos que todo se cargue dentro del WebView de la app para que el usuario no salga al navegador externo
            return false
        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
            // Mostrar la barra de carga mientras el sitio carga
            progressBar.visibility = View.VISIBLE
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            // Ocultar barra de progreso
            progressBar.visibility = View.GONE

            // Asegurar que el WebView mantenga el foco para capturar eventos del D-Pad
            webView.requestFocus()

            // Inyectar el script de navegación espacial de TV
            injectTvScript(view)
        }

        private fun injectTvScript(view: WebView?) {
            try {
                // Leer el archivo javascript desde los assets
                val script = assets.open("tv_script.js").bufferedReader().use { it.readText() }
                view?.evaluateJavascript("javascript:$script", null)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // Cliente WebChrome para manejar reproducción multimedia (Full Screen Video)
    private inner class MyWebChromeClient : WebChromeClient() {

        // Cuando la web solicita pantalla completa (HTML5 video.requestFullscreen())
        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
            if (customView != null) {
                callback?.onCustomViewHidden()
                return
            }

            customView = view
            customViewCallback = callback

            // Ocultar el WebView para dar espacio al video
            webView.visibility = View.GONE

            // Mostrar el contenedor de pantalla completa y añadir el reproductor de video
            fullscreenContainer.visibility = View.VISIBLE
            fullscreenContainer.addView(view, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))

            // Establecer UI del sistema en modo inmersivo total (sin barras de navegación ni de estado)
            window.decorView.systemUiVisibility = (
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
        }

        // Cuando la web sale de pantalla completa
        override fun onHideCustomView() {
            hideFullscreenView()
        }
    }
}
