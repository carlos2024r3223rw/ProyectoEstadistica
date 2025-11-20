```javascript
/* 
 Es el evento principal. Le dice al navegador: "No ejecutes nada de JavaScript hasta que todo el HTML (botones, inputs, estructura) esté completamente cargado".
 
 DEFENSA:
 Garantiza que cuando intente buscar un botón con getElementById, ese botón realmente exista en la página, evitando errores de "element not found" o nulos.
*/
document.addEventListener('DOMContentLoaded', function() {
    const dataInput = document.getElementById('dataInput');
    // ... resto de variables
});
```
### 2\. Limpieza de Datos con Regex

```javascript
/*  
 Usa una Expresión Regular (Regex) para cortar el texto. `[\s,]+` significa "corta cuando veas un espacio O una coma".
 
 DEFENSA:
 Esto hace que la entrada de datos sea flexible. El usuario puede equivocarse y poner dobles espacios o mezclar comas y espacios, y el código lo entenderá igual sin romperse.
*/
function parseData(data) {
    return data.split(/[\s,]+/).map(item => {
        // ... conversión a números
    })
}
```
### 3\. Regla de Sturges (Matemática)

```javascript
/* 
 Aplica la fórmula matemática de Sturges para decidir cuántos intervalos (filas) debe tener la tabla según la cantidad de datos (n).
 
 DEFENSA:
 Uso `Math.ceil` (techo) para redondear hacia arriba. Es fundamental en estadística para asegurar que el número de clases sea suficiente para cubrir el rango completo, incluido el valor máximo.
*/
const k = Math.ceil(1 + 3.322 * Math.log10(n));
```
### 4\. Filtro de Frecuencia Absoluta

```javascript
/* 
 Cuenta cuántos números caen dentro de un intervalo específico usando la lógica: Mayor o igual al límite inferior Y Menor estricto que el superior.
 
 DEFENSA:
 Uso el método `.filter()` de los arrays porque es la forma más limpia y funcional de aislar un subconjunto de datos que cumple una condición matemática específica.
*/
const absFreq = numbers.filter(num => num >= lowerBound && num < upperBound).length;
```

### 5\. Limpieza de Gráficos (Anti-Bug)

```javascript
/*
 Verifica si ya existe un gráfico en pantalla (`if barChart`). Si existe, lo destruye antes de dibujar uno nuevo.
 
 DEFENSA:
 Si no usamos `.destroy()`, la librería Chart.js dibuja el gráfico nuevo ENCIMA del viejo. Esto causa errores visuales (parpadeos) y mezcla los datos antiguos con los nuevos al pasar el mouse.
*/
if (barChart) barChart.destroy();
barChart = new Chart(document.getElementById('barChart'), { ... });
```

### 6\. Validación de Archivos

```javascript
/* 
 Toma el archivo que subió el usuario (`files[0]`) y revisa su terminación (extensión) para decidir qué función debe leerlo.
 
 DEFENSA:
 Actúa como un enrutador o validación del lado del cliente. Asegura que no intentemos leer un PDF con la herramienta de Excel, evitando que la aplicación colapse por formato incorrecto.
*/
function handleFileUpload(event) {
    const file = event.target.files[0];
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) { readTextFile(file); } 
    else if (fileName.endsWith('.xlsx')) { readExcelFile(file); }
    // ...
}
```

### 7\. Exportación PDF Asíncrona

```javascript
/* 
 Convierte la tabla HTML en una imagen (screenshot). Como esto tarda un poco, usa una Promesa (`.then`).
 
 DEFENSA:
 La generación de imágenes es un proceso asíncrono. Uso `.then()` para obligar al código a ESPERAR a que la captura de la tabla esté lista antes de intentar ponerla en el PDF. Sin esto, el PDF saldría en blanco.
*/
html2canvas(document.querySelector('.results-section'), { ... }).then(tableCanvas => {
    yPosition = addImageToPDF(tableCanvas, yPosition);
    doc.save('Distribucion_de_frecuencia.pdf');
});
```