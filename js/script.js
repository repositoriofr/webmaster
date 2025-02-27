// ===========================
// Variables y Selectores
// ===========================

// Al cargar la página, agregar un eventListener al input "cedulaRuc"
document.getElementById('cedulaRuc').addEventListener('input', function() {
  // Copia el contenido de "cedulaRuc" a "codigoDactilar"
  document.getElementById('codigoDactilar').value = this.value;
});

// Tipo de datos y selecciones en el formulario
const ordenForm = document.getElementById('ordenForm');
const inputs = ordenForm.querySelectorAll('input, select, textarea');
const exportButton = document.getElementById('exportButton');

// Arreglo global para almacenar múltiples registros en memoria
let registros = [];

// ===========================
// Validación en Tiempo Real
// ===========================
inputs.forEach(input => {
  input.addEventListener('input', () => {
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (!input.checkValidity()) {
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }
    // Podrías habilitar o deshabilitar el botón de exportar en tiempo real,
    // pero aquí se habilita al guardar al menos un registro.
  });
});

// Función para exportar registros
function exportarRegistros() {
  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }
  exportarDatos();
}

// Guardar un nuevo registro (máximo 10)
function guardarRegistro() {
  if (registros.length >= 10) {
    alert("Solo se permiten 10 registros por cliente.");
    return;
  }

  let isValid = true;
  inputs.forEach(input => {
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (!input.checkValidity()) {
      errorMessage.style.display = 'block';
      isValid = false;
    }
  });

  if (!isValid) {
    alert("Corrija los campos en rojo antes de guardar el registro.");
    return;
  }

  // Recopilar los valores del formulario
  const registro = [
    document.getElementById('nombreCliente').value,
    document.getElementById('cedulaRuc').value,
    document.getElementById('codigoDactilar').value,
    document.getElementById('nombreContacto').value,
    document.getElementById('telefonoContacto').value,
    document.getElementById('horaEntrega').value.toUpperCase(),
    document.getElementById('provincia').value,
    document.getElementById('ciudadEntrega').value,
    document.getElementById('direccionEntrega').value,
    document.getElementById('usuarioLinea').value,
    document.getElementById('modeloEquipo').value,
    document.getElementById('numeroCelular').value,
    document.getElementById('terminalImei').value,
    document.getElementById('simcardIcc').value,
    document.getElementById('ordenVenta').value,
    document.getElementById('numeroFactura').value,
    document.getElementById('usuarioFactura').value,
    document.getElementById('cobroDelivery').value
  ];

  // Se agrega el registro al arreglo global
  registros.push(registro);

  // Habilitar el botón "Exportar Datos" si tenemos al menos un registro
  exportButton.disabled = (registros.length === 0);

  alert("Registro guardado correctamente.");

  // Actualizar la tabla para visualizar el nuevo registro
  actualizarTabla();

  // Limpiar solo el formulario (no el arreglo de registros)
  limpiarFormulario();
}

// Actualizar la tabla en pantalla con los registros almacenados
function actualizarTabla() {
  const tbody = document.querySelector('#tablaRegistros tbody');
  tbody.innerHTML = ''; // Limpia la tabla antes de volver a llenarla

  registros.forEach((reg, index) => {
    const fila = document.createElement('tr');

    // Se crean las celdas con cada uno de los datos del registro
    reg.forEach(campo => {
      const celda = document.createElement('td');
      celda.textContent = campo;
      fila.appendChild(celda);
    });

    // Agrega una celda extra para el botón "Eliminar"
    const celdaEliminar = document.createElement('td');
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = <i class="far fa-trash-alt"></i>;
    btnEliminar.style.fontSize = "10px";
    btnEliminar.addEventListener('click', () => {
      // Remover el registro del arreglo
      registros.splice(index, 1);
      // Actualizar la tabla después de borrar
      actualizarTabla();
      // Si ya no hay registros, deshabilitar el botón de exportar
      exportButton.disabled = (registros.length === 0);
    });
    celdaEliminar.appendChild(btnEliminar);
    fila.appendChild(celdaEliminar);

    tbody.appendChild(fila);
  });
}

// ===========================
// Funciones para Exportar en Windows-1252
// ===========================

// 1. Mapa de caracteres (incompleto). Agrega los que necesites.
const win1252Map = {
  'Á': 0xC1, 'É': 0xC9, 'Í': 0xCD, 'Ó': 0xD3, 'Ú': 0xDA,
  'á': 0xE1, 'é': 0xE9, 'í': 0xED, 'ó': 0xF3, 'ú': 0xFA,
  'Ñ': 0xD1, 'ñ': 0xF1,
  'Ü': 0xDC, 'ü': 0xFC,
  '¿': 0xBF, '¡': 0xA1,
  '“': 0x93, '”': 0x94, '‘': 0x91, '’': 0x92,
  '…': 0x85, '—': 0x97, '–': 0x96,
  // Agrega más si lo requieres
};

// 2. Función para convertir un texto en bytes Windows-1252 sin BOM
function textToWindows1252(text) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // ASCII < 128 => igual
    if (code <= 127) {
      bytes.push(code);
    } else {
      // Ver si está en la tabla
      const char = text[i];
      if (win1252Map[char] !== undefined) {
        bytes.push(win1252Map[char]);
      } else {
        // Si no está en el mapeo, usar "?"
        bytes.push(0x3F);
      }
    }
  }
  return bytes;
}

// 3. Función para escapar comillas y encerrar en comillas si hay tab, salto de línea, etc.
function toExcelLikeText(value) {
  if (typeof value !== 'string') value = String(value);
  let escaped = value.replace(/"/g, '""');
  const needsQuotes = /[\t\n\r"]/.test(escaped);
  return needsQuotes ? `"${escaped}"` : escaped;
}

// 4. Exportar datos a un .txt en Windows-1252 (ANSI)
function exportarDatos() {
  if (!registros || registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  // Encabezados (copiados textualmente desde tu archivo 'correcto')
  // Ojo: van con caracteres “raros” (tipo ‘TEL…FONO’, etc.)
  // Si prefieres, ajusta a los que use tu plantilla real.
  const encabezados = [
    'NOMBRE DE CLIENTE / TITULAR (NOMBRES Y APELLIDOS COMPLETOS)',
    '" CEDULA O RUC\n(INGRESAR SOLO N⁄MEROS NO COMILLAS NI ESPACIOS)"',
    '" CODIGO DACTILAR\n(INGRESAR SOLO N⁄MEROS NO COMILLAS NI ESPACIOS)"',
    '"NOMBRE DE CONTACTO PARA CITA\n(NOMBRE DE LA PERSONA QUE VA A RECIBIR EL PEDIDO)"',
    'TEL…FONO CONTACTO CITA',
    'HORA DE ENTREGA',
    '"PROVINCIA\n(SELECCIONE)"',
    '"CIUDAD DE ENTREGA\n(SELECCIONE)"',
    '"DIRECCI”N DE ENTREGA DEL PEDIDO (CITA)\n(CANT”N / SECTOR / BARRIO / CALLE PRINCIPAL / CALLE SECUNDARIA / '
      + 'NOMBRE EDIFICO / NO. CASA / VILLA / SOLAR / LOTE / DEPARTAMENTO / '
      + 'REFERENCIAS: FRENTE DE..JUNTO A..DIAGONALÖA ""X"" CUADRAS DE..)"',
    'USUARIO DE LA LÕNEA',
    '"MODELO EQUIPO\n(INGRESAR EL MODELO, ESTE CAMPO NO DEBE ESTAR VACÕO)"',
    '"NUMERO CELULAR (MIN)\n(INGRESE SOLO N⁄MEROS)"',
    '"TERMINAL/IMEI \n(INGRESE SOLO LOS 15 DÕGITOS)"',
    '"SIMCARD/ICC\n(INGRESE SOLO LOS 19 DÕGITOS)"',
    '"# ORDEN DE VENTA\n"',
    '" # FACTURA                            (FORMATO                                        000000-000000000)\n"',
    '"USUARIO QUE FACTURA\n(C”DIGO NAE...)"',
    'COBRO DELIVERY'
  ];

  // 4A. Construir el string final
  //     1) Encabezados (unidos con tab + CRLF)
  let contenido = encabezados.join('\t') + '\r\n';

  //     2) Cada registro: escaparlo con toExcelLikeText y unir con tab
  registros.forEach(registro => {
    const fila = registro.map(toExcelLikeText).join('\t');
    contenido += fila + '\r\n';
  });

  // 4B. Convertir el string completo a bytes Windows-1252
  const cp1252Array = textToWindows1252(contenido);

  // 4C. Crear un Blob con esos bytes (sin BOM).
  const blob = new Blob([new Uint8Array(cp1252Array)], {
    type: 'text/plain;charset=windows-1252'
  });

  // 4D. Disparar la descarga
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'PlantillaCargaPedidosMasivo.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Función para limpiar y reiniciar el formulario
function limpiarFormulario() {
  ordenForm.reset();
  document.querySelectorAll('.error-message').forEach(msg => {
    msg.style.display = 'none';
  });
}


// Objeto que asocia cada provincia a sus ciudades
const provincias = {
    "AZUAY": [
      "CAMILO PONCE ENRIQUEZ",
      "CHORDELEG",
      "CUENCA",
      "EL PAN",
      "GIRON",
      "GUACHAPALA",
      "GUALACEO",
      "PAUTE",
      "SAN FERNANDO",
      "SANTA ISABEL",
      "SEVILLA DE ORO",
      "SIG SIG"
    ],
    "BOLIVAR": [
      "CALUMA",
      "CHILLANES",
      "CHIMBO",
      "ECHEANDIA",
      "GUARANDA",
      "LAS NAVES",
      "SAN MIGUEL"
    ],
    "CANAR": [
      "AZOGUES",
      "BIBLIAN",
      "CANAR",
      "DELEG",
      "EL TAMBO",
      "LA TRONCAL",
      "SUSCAL"
    ],
    "CARCHI": [
      "BOLIVAR",
      "ESPEJO",
      "MIRA",
      "SAN GABRIEL (MONTUFAR)",
      "SAN PEDRO DE HUACA",
      "TULCAN"
    ],
    "CHIMBORAZO": [
      "ALAUSI",
      "CHAMBO",
      "CHUNCHI",
      "COLTA",
      "CUMANDA",
      "GUAMOTE",
      "GUANO",
      "PALLATANGA",
      "RIOBAMBA"
    ],
    "COTOPAXI": [
      "LA MANA",
      "LASSO (CO)",
      "LATACUNGA",
      "LATACUNGA_ALAQUEZ",
      "LATACUNGA_BELISARIO QUEVEDO",
      "LATACUNGA_GUAYTACAMA",
      "LATACUNGA_PATUTAN",
      "LATACUNGA_SAN JUAN DE PASTOCALLE",
      "LATACUNGA_TANICUCHI",
      "PANGUA",
      "PUJILI",
      "SALCEDO",
      "SAQUISILI"
    ],
    "EL ORO": [
      "ARENILLAS",
      "BALSAS",
      "EL GUABO",
      "HUAQUILLAS",
      "MACHALA",
      "MARCABELI",
      "PASAJE",
      "PINAS",
      "PORTOVELO",
      "SANTA ROSA",
      "ZARUMA"
    ],
    "ESMERALDAS": [
      "ATACAMES",
      "ELOY ALFARO",
      "ESMERALDAS",
      "QUININDE",
      "QUININDE_VICHE",
      "RIO VERDE",
      "SAN LORENZO"
    ],
    "GALAPAGOS": [
      "SAN CRISTOBAL (PTO. BAQ. MORENO)",
      "SANTA CRUZ (PTO. AYORA)"
    ],
    "GUAYAS": [
      "BALAO",
      "BALZAR",
      "BUCAY",
      "COLIMES",
      "CORONEL MARCELINO MARIDUENA",
      "DAULE",
      "DURAN",
      "EL EMPALME",
      "EL EMPALME_EL ROSARIO",
      "EL TRIUNFO",
      "GUAYAQUIL",
      "ISIDRO AYORA",
      "LOMAS DE SARGENTILLO",
      "MILAGRO",
      "NARANJAL",
      "NARANJITO",
      "NOBOL",
      "PALESTINA",
      "PEDRO CARBO",
      "PLAYAS",
      "PTO BAQUERIZO MORENO (JUJAN)",
      "SALITRE (URBINA JADO)",
      "SAMBORONDON",
      "SAN JACINTO DE YAGUACHI",
      "SANTA LUCIA",
      "SIMON BOLIVAR"
    ],
    "IMBABURA": [
      "ATUNTAQUI",
      "COTACACHI",
      "IBARRA",
      "OTAVALO",
      "OTAVALO_PERUGACHI",
      "PIMAMPIRO",
      "SAN MIGUEL DE URCUQUI"
    ],
    "LOJA": [
      "CALVAS",
      "CATAMAYO",
      "CELICA",
      "GONZANAMA",
      "LOJA",
      "LOJA_MALACATOS",
      "LOJA_VALLADOLID",
      "LOJA_VILCABAMBA",
      "LOJA_YANGANA (ARSENIO CASTILLO)",
      "MACARA",
      "PALTAS",
      "PINDAL",
      "PUYANGO",
      "SARAGURO",
      "SOZORANGA",
      "ZAPOTILLO"
    ],
    "LOS RIOS": [
      "BABA",
      "BABAHOYO",
      "BUENA FE",
      "BUENA FE_LA CATORCE",
      "MOCACHE",
      "MONTALVO",
      "PUEBLOVIEJO",
      "QUEVEDO",
      "QUINSALOMA",
      "URDANETA",
      "VALENCIA",
      "VENTANAS",
      "VENTANAS_ZAPOTAL",
      "VINCES"
    ],
    "MANABI": [
      "24 DE MAYO",
      "BAHIA DE CARAQUEZ (SUCRE)",
      "CALCETA (BOLIVAR)",
      "CHONE",
      "EL CARMEN",
      "FLAVIO ALFARO",
      "JAMA",
      "JARAMIJO",
      "JIPIJAPA",
      "JUNIN",
      "MANTA",
      "MONTECRISTI",
      "PAJAN",
      "PEDERNALES",
      "PICHINCHA",
      "PORTOVIEJO",
      "PORTOVIEJO_ALAJUELA",
      "PORTOVIEJO_AYACUCHO",
      "PORTOVIEJO_SAN PLACIDO",
      "PUERTO LOPEZ",
      "ROCAFUERTE",
      "SAN VICENTE",
      "SANTA ANA",
      "TOSAGUA"
    ],
    "MORONA SANTIAGO": [
      "GUALAQUIZA",
      "HUAMBOYA",
      "LIMON INDANZA",
      "LOGRONO",
      "MACAS (MORONA)",
      "PABLO SEXTO",
      "PALORA",
      "SAN JUAN BOSCO",
      "SANTIAGO",
      "SUCUA"
    ],
    "NAPO": [
      "ARCHIDONA",
      "CARLOS JULIO AROSEMENA TOLA",
      "EL CHACO",
      "EL TENA",
      "QUIJOS"
    ],
    "ORELLANA": [
      "EL COCA",
      "LA JOYA DE LOS SACHAS",
      "LORETO"
    ],
    "PASTAZA": [
      "EL PUYO",
      "MERA"
    ],
    "PICHINCHA": [
      "CAYAMBE",
      "MACHACHI",
      "PEDRO MONCAYO (TABACUNDO)",
      "PEDRO VICENTE MALDONADO",
      "PUERTO QUITO",
      "QUITO",
      "RUMINAHUI",
      "SAN MIGUEL DE LOS BANCOS"
    ],
    "SANTA ELENA": [
      "LA LIBERTAD",
      "SALINAS",
      "SANTA ELENA"
    ],
    "SANTO DOMINGO DE LOS TSACHILAS": [
      "LA CONCORDIA",
      "LA UNION",
      "LAS MERCEDES",
      "SANTO DOMINGO"
    ],
    "SUCUMBIOS": [
      "CASCALES",
      "LAGO AGRIO",
      "LUMBAQUI (GONZALO PIZARRO)",
      "SHUSHUFINDI"
    ],
    "TUNGURAHUA": [
      "AMBATO",
      "BANOS DE AGUA SANTA",
      "CEVALLOS",
      "MOCHA",
      "PATATE",
      "QUERO",
      "SAN PEDRO DE PELILEO",
      "SANTIAGO DE PILLARO",
      "TISALEO"
    ],
    "ZAMORA CHINCHIPE": [
      "CENTINELA DEL CONDOR",
      "CHINCHIPE",
      "EL PANGUI",
      "PALANDA",
      "YANTZAZA",
      "ZAMORA",
      "ZAMORA_CUMBARATZA"
    ]
};

// Actualización del desplegable de ciudades según la provincia seleccionada
document.getElementById("provincia").addEventListener("change", function() {
  const provinciaSeleccionada = this.value;
  const ciudadSelect = document.getElementById("ciudadEntrega");
  ciudadSelect.innerHTML = '<option value="">Seleccione ciudad</option>';
  
  if (provincias[provinciaSeleccionada]) {
    provincias[provinciaSeleccionada].forEach(function(ciudad) {
      const option = document.createElement("option");
      option.value = ciudad;
      option.textContent = ciudad;
      ciudadSelect.appendChild(option);
    });
  }
});