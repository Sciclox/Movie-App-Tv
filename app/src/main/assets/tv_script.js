(function() {
    console.log("LaMovie TV spatial navigation script initialized.");

    // 1. Inyectar estilos CSS para el estado de enfoque
    const style = document.createElement('style');
    style.id = 'tv-navigation-styles';
    style.innerHTML = `
        /* Efecto de borde brillante rojo LaMovie para el elemento enfocado */
        a:focus, button:focus, input:focus, select:focus, textarea:focus, 
        [tabindex="0"]:focus, .tv-focused {
            outline: 5px solid #ff4343 !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 25px rgba(255, 67, 67, 0.95) !important;
            transform: scale(1.05) !important;
            transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out, outline 0.15s ease-in-out !important;
            position: relative !important;
            z-index: 9999999 !important;
        }

        /* Ocultar las barras de desplazamiento por completo para una estética de TV limpia */
        ::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
        }
        
        html, body {
            scroll-behavior: smooth !important;
            scrollbar-width: none !important; /* Firefox */
            -ms-overflow-style: none !important; /* IE */
        }
    `;
    document.head.appendChild(style);

    // Verificar si un elemento es visible y está dentro de la pantalla
    function isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && 
               rect.height > 0 && 
               style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    // Obtener todos los elementos interactivos enfocables
    function getFocusableElements() {
        // Buscamos enlaces, botones, inputs y elementos interactivos personalizados
        const selector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"], .popular-card, .movie-card, .play-btn, .episode-item, .player-option';
        const elements = Array.from(document.querySelectorAll(selector));
        
        return elements.filter(el => {
            // Asegurar que tengan tabindex para poder recibir foco
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
            return isElementVisible(el);
        });
    }

    // Obtener el elemento que tiene el foco actual
    function getFocusedElement() {
        let active = document.activeElement;
        if (!active || active === document.body || active === document.documentElement) {
            // Si el foco nativo está en el body, buscamos si marcamos uno virtualmente
            active = document.querySelector('.tv-focused');
        }
        return active;
    }

    // Asignar el foco a un elemento y hacer scroll para centrarlo
    function focusElement(el) {
        if (!el) return;

        // Remover el estilo del elemento previamente enfocado
        document.querySelectorAll('.tv-focused').forEach(item => {
            item.classList.remove('tv-focused');
        });

        // Aplicar foco nativo y clase de estilo
        el.focus();
        el.classList.add('tv-focused');

        // Hacer scroll suave para mantener el elemento enfocado en el centro del televisor
        el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }

    // Calcular la puntuación de distancia física entre el elemento origen y el destino
    function calculateDistanceScore(fromRect, toRect, direction) {
        const fromCenter = {
            x: fromRect.left + fromRect.width / 2,
            y: fromRect.top + fromRect.height / 2
        };
        const toCenter = {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2
        };

        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;

        // Validar si el elemento candidato está realmente en la dirección de movimiento
        // Para evitar saltos no deseados, penalizamos fuertemente el eje secundario (desalineación)
        switch (direction) {
            case 'up':
                if (toCenter.y >= fromCenter.y - 5) return Infinity; // Permitimos un margen de 5px de superposición
                return Math.abs(dy) + Math.abs(dx) * 4;
            case 'down':
                if (toCenter.y <= fromCenter.y + 5) return Infinity;
                return Math.abs(dy) + Math.abs(dx) * 4;
            case 'left':
                if (toCenter.x >= fromCenter.x - 5) return Infinity;
                return Math.abs(dx) + Math.abs(dy) * 4;
            case 'right':
                if (toCenter.x <= fromCenter.x + 5) return Infinity;
                return Math.abs(dx) + Math.abs(dy) * 4;
        }
        return Infinity;
    }

    // Mover el foco en la dirección especificada
    function navigate(direction) {
        const current = getFocusedElement();
        const focusables = getFocusableElements();

        if (!current || current === document.body || current === document.documentElement) {
            // Si no hay nada enfocado, enfocar el primer elemento disponible
            if (focusables.length > 0) {
                focusElement(focusables[0]);
            }
            return;
        }

        const currentRect = current.getBoundingClientRect();
        let bestCandidate = null;
        let minScore = Infinity;

        focusables.forEach(el => {
            if (el === current) return;
            const elRect = el.getBoundingClientRect();
            const score = calculateDistanceScore(currentRect, elRect, direction);
            
            if (score < minScore) {
                minScore = score;
                bestCandidate = el;
            }
        });

        if (bestCandidate) {
            focusElement(bestCandidate);
        }
    }

    // Interceptar eventos de teclas direccionales (D-Pad)
    window.addEventListener('keydown', function(event) {
        let handled = false;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'Up':
                navigate('up');
                handled = true;
                break;
            case 'ArrowDown':
            case 'Down':
                navigate('down');
                handled = true;
                break;
            case 'ArrowLeft':
            case 'Left':
                navigate('left');
                handled = true;
                break;
            case 'ArrowRight':
            case 'Right':
                navigate('right');
                handled = true;
                break;
            case 'Enter':
                const current = getFocusedElement();
                if (current) {
                    // Simular click físico en el elemento enfocado
                    current.click();
                    handled = true;
                }
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true); // Capturar antes de que otros listeners lo consuman

    // Inicializar foco al cargar la página
    function initFocus() {
        const focusables = getFocusableElements();
        if (focusables.length > 0) {
            focusElement(focusables[0]);
        }
    }

    // Monitorear cambios en el DOM (ya que es una React SPA y las películas cargan asíncronamente)
    let checkTimer = setInterval(() => {
        // Si no hay ningún elemento seleccionado en pantalla, intentar re-enfocar
        const current = getFocusedElement();
        if (!current || !isElementVisible(current)) {
            initFocus();
        }
        
        // Buscar nuevos elementos y asignarles el tabindex="0" si corresponde
        const selector = 'a[href], button:not([disabled]), .popular-card, .movie-card, .play-btn, .episode-item, .player-option';
        document.querySelectorAll(selector).forEach(el => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
    }, 1500);

    // Iniciar foco inicial después de un breve retraso
    setTimeout(initFocus, 1000);

})();
