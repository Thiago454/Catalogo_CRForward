// ========================= //
// INTRO VIDEO AUTO CLOSE
// ========================= //
window.addEventListener('load', function () {

    const intro = document.getElementById('intro-screen');

    // Bloquear scroll durante intro
    document.body.classList.add('no-scroll');

    setTimeout(() => {

        intro.style.display = 'none';

        // Restaurar scroll
        document.body.classList.remove('no-scroll');

    }, 5000);

});

// ========================= //
// PDF.js
// ========================= //
const pdfjsLib = window['pdfjs-dist/build/pdf'];

let currentLoadingTask = null;

// ========================= //
// USUARIOS FICTICIOS
// ========================= //
function updateCounters() {

    const counts = document.querySelectorAll('.user-count');

    const activeUsers =
        Math.floor(Math.random() * 20) + 5;

    counts.forEach(el => {
        el.innerText = `${activeUsers} viendo ahora`;
    });

}

setInterval(updateCounters, 4000);

updateCounters();

// ========================= //
// ABRIR PDF
// ========================= //
async function openPDF(filePath, title) {

    const menu = document.getElementById('main-menu');

    const viewer = document.getElementById('pdf-viewer');

    const titleHeader =
        document.getElementById('pdf-title');

    const container =
        document.getElementById('pdf-pages-container');

    const loader =
        document.getElementById('loader');

    const scrollContainer =
        document.getElementById('pdf-scroll-container');

    // Loader ON
    loader.classList.remove('hidden');

    titleHeader.innerText = title;

    container.innerHTML = '';

    // Scroll top
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }

    try {

        // Ocultar menú
        menu.style.opacity = "0";

        setTimeout(() => {

            menu.classList.add('hidden');

            viewer.classList.remove('hidden');

        }, 250);

        // Historial real
        history.pushState({ pdfOpen: true }, '');

        // Limpiar tarea anterior
        if (currentLoadingTask) {

            await currentLoadingTask.destroy();

            currentLoadingTask = null;

        }

        // Cargar PDF
        currentLoadingTask = pdfjsLib.getDocument({
            url: filePath,
            disableAutoFetch: false,
            disableStream: false
        });

        const pdf = await currentLoadingTask.promise;

        loader.classList.add('hidden');

        const totalPages = pdf.numPages;

        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {

            const page = await pdf.getPage(pageNum);

            const isMobile =
                window.innerWidth <= 768;

            const viewport = page.getViewport({
                scale: isMobile ? 1.1 : 1.5
            });

            const canvas =
                document.createElement('canvas');

            const context =
                canvas.getContext('2d', {
                    alpha: false
                });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            container.appendChild(canvas);

            // Animación
            canvas.style.opacity = "0";
            canvas.style.transform =
                "translateY(30px)";

            requestAnimationFrame(() => {

                canvas.style.transition = ".4s ease";

                canvas.style.opacity = "1";

                canvas.style.transform =
                    "translateY(0px)";

            });

            // Render
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        }

    } catch (error) {

        console.error(error);

        loader.classList.add('hidden');

        container.innerHTML = `
        <h2 style="
            color:white;
            text-align:center;
            margin-top:50px;
        ">
            Error al abrir catálogo
        </h2>
        `;

    }

}

// ========================= //
// CERRAR PDF
// ========================= //
async function closePDF() {

    const menu = document.getElementById('main-menu');

    const viewer =
        document.getElementById('pdf-viewer');

    const container =
        document.getElementById('pdf-pages-container');

    viewer.classList.add('hidden');

    menu.classList.remove('hidden');

    container.innerHTML = '';

    if (currentLoadingTask) {

        await currentLoadingTask.destroy();

        currentLoadingTask = null;

    }

    setTimeout(() => {
        menu.style.opacity = "1";
    }, 100);

}

// ========================= //
// UNIVERSAL SWIPE SYSTEM
// ========================= //
let touchStartX = 0;
let touchEndX = 0;

let touchStartY = 0;
let touchEndY = 0;

const viewerElement =
    document.getElementById('pdf-viewer');

// TOUCH START
viewerElement.addEventListener(
    'touchstart',
    e => {

        touchStartX =
            e.changedTouches[0].screenX;

        touchStartY =
            e.changedTouches[0].screenY;

    },
    { passive: true }
);

// TOUCH END
viewerElement.addEventListener(
    'touchend',
    e => {

        touchEndX =
            e.changedTouches[0].screenX;

        touchEndY =
            e.changedTouches[0].screenY;

        const diffX =
            touchEndX - touchStartX;

        const diffY =
            Math.abs(
                touchEndY - touchStartY
            );

        // Swipe horizontal
        if (diffX > 90 && diffX > diffY) {

            if (
                !viewerElement.classList.contains('hidden')
            ) {
                history.back();
            }

        }

    },
    { passive: true }
);

// MOUSE / LAPTOP / GAMER
let isMouseDown = false;

viewerElement.addEventListener(
    'mousedown',
    e => {

        isMouseDown = true;

        touchStartX = e.clientX;

        touchStartY = e.clientY;

    }
);

viewerElement.addEventListener(
    'mouseup',
    e => {

        if (!isMouseDown) return;

        isMouseDown = false;

        touchEndX = e.clientX;

        touchEndY = e.clientY;

        const diffX =
            touchEndX - touchStartX;

        const diffY =
            Math.abs(
                touchEndY - touchStartY
            );

        if (diffX > 120 && diffX > diffY) {

            if (
                !viewerElement.classList.contains('hidden')
            ) {
                history.back();
            }

        }

    }
);

// ========================= //
// BOTÓN ATRÁS
// ========================= //
window.addEventListener('popstate', () => {

    if (
        !viewerElement.classList.contains('hidden')
    ) {
        closePDF();
    }

});

// ========================= //
// SEGURIDAD
// ========================= //

// CLICK DERECHO
document.addEventListener(
    'contextmenu',
    e => e.preventDefault()
);

// BLOQUEAR DRAG
document.addEventListener(
    'dragstart',
    e => e.preventDefault()
);

// BLOQUEAR TECLAS
document.addEventListener(
    'keydown',
    function (e) {

        // Ctrl+P / Cmd+P
        if (
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === 'p'
        ) {
            e.preventDefault();
            return;
        }

        // DEVTOOLS
        if (

            e.key === 'F12' ||

            (
                e.ctrlKey &&
                e.shiftKey &&
                (
                    e.key === 'I' ||
                    e.key === 'J' ||
                    e.key === 'C'
                )
            ) ||

            (
                e.ctrlKey &&
                e.key.toLowerCase() === 'u'
            )

        ) {
            e.preventDefault();
        }

    }
);

// IMPRESIÓN
window.addEventListener(
    'beforeprint',
    e => {

        e.preventDefault();

        document.body.innerHTML = '';

    }
);