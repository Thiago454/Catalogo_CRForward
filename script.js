// 1. Configuración de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Variable para controlar si hay una carga en curso y poder detenerla si es necesario
let currentLoadingTask = null;

// 2. Sistema de usuarios concurrentes
function updateCounters() {
    const counts = document.querySelectorAll('.user-count');
    const activeUsers = Math.floor(Math.random() * 20) + 5; 
    counts.forEach(el => { el.innerText = `${activeUsers} viendo ahora`; });
}
setInterval(updateCounters, 4000);
updateCounters();

// 3. Función Principal de Apertura
async function openPDF(filePath, title) {
    const menu = document.getElementById('main-menu');
    const viewer = document.getElementById('pdf-viewer');
    const titleHeader = document.getElementById('pdf-title');
    const container = document.getElementById('pdf-pages-container');
    const scrollContainer = document.getElementById('pdf-scroll-container');

    // SI HAY UNA TAREA ANTERIOR, INTENTAMOS CANCELARLA
    if (currentLoadingTask) {
        await currentLoadingTask.destroy();
    }

    // Preparar UI y Resetear Scroll al inicio
    titleHeader.innerText = title;
    container.innerHTML = '<h3 style="color:white; text-align:center; margin-top:50px;">Cargando catálogo...</h3>';
    if(scrollContainer) scrollContainer.scrollTop = 0;
    
    // Transición de salida del menú
    menu.style.opacity = "0";
    
    setTimeout(async () => {
        menu.classList.add('hidden');
        viewer.classList.remove('hidden');
        viewer.style.opacity = "1";

        // Iniciar renderizado
        try {
            currentLoadingTask = pdfjsLib.getDocument(filePath);
            const pdf = await currentLoadingTask.promise;
            
            container.innerHTML = ''; // Limpiar mensaje de carga

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                // Verificar si el usuario cerró el visor mientras cargaba
                if (viewer.classList.contains('hidden')) break;

                const page = await pdf.getPage(pageNum);
                const isMobile = window.innerWidth <= 768;
                const viewport = page.getViewport({ scale: isMobile ? 1.0 : 1.5 }); 

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                container.appendChild(canvas);
                await page.render(renderContext).promise;
            }
        } catch (error) {
            console.error('Error en PDF:', error);
            container.innerHTML = '<h3 style="color:red; text-align:center;">Error al abrir el documento. Intenta de nuevo.</h3>';
        }
    }, 400);
}

// 4. Función de Cierre (Clave para que el siguiente cargue bien)
function closePDF() {
    const menu = document.getElementById('main-menu');
    const viewer = document.getElementById('pdf-viewer');
    const container = document.getElementById('pdf-pages-container');

    viewer.style.opacity = "0"; 
    
    setTimeout(() => {
        viewer.classList.add('hidden');
        menu.classList.remove('hidden');
        
        // Limpieza profunda
        container.innerHTML = ''; 
        
        // Cancelar cualquier tarea de PDF.js activa
        if (currentLoadingTask) {
            currentLoadingTask.destroy();
            currentLoadingTask = null;
        }

        setTimeout(() => { menu.style.opacity = "1"; }, 50);
    }, 400);
}

// Bloqueo de clic derecho
document.addEventListener('contextmenu', e => e.preventDefault());