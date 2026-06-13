(function() {
    console.log("LaMovie TV virtual mouse cursor initialized.");

    // 1. Crear el elemento visual del cursor (puntero rojo brillante)
    const cursor = document.createElement('div');
    cursor.id = 'tv-virtual-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #ffffff 20%, #ff4343 60%, rgba(255,67,67,0.8) 100%);
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 20px #ff4343, 0 0 35px rgba(255, 67, 67, 0.5);
        pointer-events: none; /* Crucial: para que el puntero no bloquee elementFromPoint */
        z-index: 2147483647; /* Máximo z-index para estar por encima de los reproductores */
        transform: translate(-10px, -10px); /* Centrar el círculo sobre la coordenada X, Y */
        transition: transform 0.05s ease-out;
    `;
    document.body.appendChild(cursor);

    // Ocultar las barras de desplazamiento por completo para una estética de TV limpia
    const style = document.createElement('style');
    style.innerHTML = `
        ::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
        }
        html, body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }
    `;
    document.head.appendChild(style);

    // Posición inicial en el centro de la pantalla
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    function updateCursorPosition() {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        simulateHover();
    }

    // Inicializar posición del cursor
    updateCursorPosition();

    let lastHoveredElement = null;

    // Simular el estado hover (mouse-over) en el elemento bajo el puntero
    function simulateHover() {
        const element = document.elementFromPoint(cursorX, cursorY);
        if (!element) return;

        if (element !== lastHoveredElement) {
            // Despachar eventos de salida al elemento anterior
            if (lastHoveredElement) {
                lastHoveredElement.dispatchEvent(new MouseEvent('mouseout', {
                    bubbles: true,
                    cancelable: true,
                    clientX: cursorX,
                    clientY: cursorY
                }));
                lastHoveredElement.dispatchEvent(new MouseEvent('mouseleave', {
                    bubbles: true,
                    cancelable: true,
                    clientX: cursorX,
                    clientY: cursorY
                }));
            }

            // Despachar eventos de entrada al nuevo elemento
            element.dispatchEvent(new MouseEvent('mouseover', {
                bubbles: true,
                cancelable: true,
                clientX: cursorX,
                clientY: cursorY
            }));
            element.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true,
                clientX: cursorX,
                clientY: cursorY
            }));

            lastHoveredElement = element;
        }

        // Despachar evento de movimiento continuo
        element.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: cursorX,
            clientY: cursorY
        }));
    }

    // Simular un clic de ratón físico en la coordenada del puntero
    function clickElement() {
        const element = document.elementFromPoint(cursorX, cursorY);
        if (!element) return;

        console.log("Virtual click on:", element);

        // Feedback visual de click (encoger el cursor brevemente)
        cursor.style.transform = 'translate(-10px, -10px) scale(0.6)';
        setTimeout(() => {
            cursor.style.transform = 'translate(-10px, -10px) scale(1)';
        }, 150);

        // Secuencia completa de eventos de clic
        const mousedown = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: cursorX,
            clientY: cursorY
        });
        const mouseup = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: cursorX,
            clientY: cursorY
        });
        const click = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: cursorX,
            clientY: cursorY
        });

        element.dispatchEvent(mousedown);
        element.dispatchEvent(mouseup);
        element.dispatchEvent(click);
    }

    // Configuración de velocidad y límites del cursor
    const moveStep = 25; // Píxeles que se desplaza el cursor por cada toque
    const scrollStep = 100; // Píxeles que se desplaza la página cuando el cursor choca con el borde
    const edgeMargin = 70; // Margen en los bordes de la pantalla para activar el scroll

    function handleMove(direction) {
        switch (direction) {
            case 'up':
                if (cursorY > edgeMargin) {
                    cursorY -= moveStep;
                } else {
                    window.scrollBy(0, -scrollStep);
                }
                break;
            case 'down':
                if (cursorY < window.innerHeight - edgeMargin) {
                    cursorY += moveStep;
                } else {
                    window.scrollBy(0, scrollStep);
                }
                break;
            case 'left':
                if (cursorX > edgeMargin) {
                    cursorX -= moveStep;
                } else {
                    window.scrollBy(-scrollStep, 0);
                }
                break;
            case 'right':
                if (cursorX < window.innerWidth - edgeMargin) {
                    cursorX += moveStep;
                } else {
                    window.scrollBy(scrollStep, 0);
                }
                break;
        }
        // Limitar coordenadas para que no se salga de la pantalla
        cursorX = Math.max(10, Math.min(window.innerWidth - 10, cursorX));
        cursorY = Math.max(10, Math.min(window.innerHeight - 10, cursorY));

        updateCursorPosition();
    }

    // Escuchar teclas del D-Pad
    window.addEventListener('keydown', function(event) {
        let handled = false;
        switch (event.key) {
            case 'ArrowUp':
            case 'Up':
                handleMove('up');
                handled = true;
                break;
            case 'ArrowDown':
            case 'Down':
                handleMove('down');
                handled = true;
                break;
            case 'ArrowLeft':
            case 'Left':
                handleMove('left');
                handled = true;
                break;
            case 'ArrowRight':
            case 'Right':
                handleMove('right');
                handled = true;
                break;
            case 'Enter':
                clickElement();
                handled = true;
                break;
        }
        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    // Ajustar límites y centrar en cambios de tamaño
    window.addEventListener('resize', function() {
        cursorX = Math.min(cursorX, window.innerWidth - 10);
        cursorY = Math.min(cursorY, window.innerHeight - 10);
        updateCursorPosition();
    });

    // Asegurar que el cursor se recree si la SPA de React reemplaza por completo el DOM
    setInterval(() => {
        if (!document.getElementById('tv-virtual-cursor')) {
            document.body.appendChild(cursor);
        }
    }, 2000);

})();
