document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes();
    cargarPacientesParaMedico();
    cargarPacientesParaSecretario();
    cargarCitas();
});

// **PACIENTE - Registro de Datos Médicos**
if (document.getElementById("formPaciente")) {
    document.getElementById("formPaciente").addEventListener("submit", function(event) {
        event.preventDefault();
        const nombre = document.getElementById("nombrePaciente").value.trim();
        const tipoSangre = document.getElementById("tipoSangre").value;
        const edad = parseInt(document.getElementById("edadPaciente").value);
        const altura = parseInt(document.getElementById("alturaPaciente").value);
        const sexo = document.getElementById("sexoPaciente").value;
        const historiaMedica = document.getElementById("historiaMedica").files[0]; // Capturar el archivo PDF

        // Validar datos
        if (!validarFormularioPaciente(nombre, tipoSangre, edad, altura, sexo, historiaMedica)) {
            return;
        }

        // Convertir el archivo PDF a Base64 para guardarlo en localStorage
        const reader = new FileReader();
        reader.onload = function(e) {
            const pdfBase64 = e.target.result;

            // Guardar en localStorage
            let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
            pacientes.push({ 
                nombre, 
                tipoSangre, 
                edad, 
                altura, 
                sexo, 
                historiaMedica: pdfBase64 // Guardar el PDF en Base64
            });
            localStorage.setItem("pacientes", JSON.stringify(pacientes));

            alert("Paciente registrado correctamente.");
            document.getElementById("formPaciente").reset(); // Limpiar el formulario
            cargarPacientes(); // Recargar la lista de pacientes
        };

        if (historiaMedica) {
            reader.readAsDataURL(historiaMedica); // Leer el archivo como Data URL
        } else {
            // Si no se sube un archivo, guardar sin PDF
            let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
            pacientes.push({ 
                nombre, 
                tipoSangre, 
                edad, 
                altura, 
                sexo, 
                historiaMedica: null // No hay PDF
            });
            localStorage.setItem("pacientes", JSON.stringify(pacientes));

            alert("Paciente registrado correctamente.");
            document.getElementById("formPaciente").reset(); // Limpiar el formulario
            cargarPacientes(); // Recargar la lista de pacientes
        }
    });
}

// Función para validar el formulario de paciente
function validarFormularioPaciente(nombre, tipoSangre, edad, altura, sexo, historiaMedica) {
    if (!nombre || !tipoSangre || !edad || !altura || !sexo) {
        alert("Todos los campos son obligatorios.");
        return false;
    }

    if (edad < 0 || edad > 120) {
        alert("La edad debe estar entre 0 y 120 años.");
        return false;
    }

    if (altura < 50 || altura > 250) {
        alert("La altura debe estar entre 50 y 250 cm.");
        return false;
    }

    // Validar que el archivo sea un PDF (si se subió)
    if (historiaMedica && historiaMedica.type !== "application/pdf") {
        alert("El archivo debe ser un PDF.");
        return false;
    }

    return true;
}

// Cargar pacientes en la lista
function cargarPacientes() {
    if (document.getElementById("listaPacientes")) {
        const lista = document.getElementById("listaPacientes");
        lista.innerHTML = "";
        let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        pacientes.forEach((paciente, index) => {
            let div = document.createElement("div");
            div.innerHTML = `
                <p><strong>Nombre:</strong> ${paciente.nombre}</p>
                <p><strong>Tipo de Sangre:</strong> ${paciente.tipoSangre}</p>
                <p><strong>Edad:</strong> ${paciente.edad} años</p>
                <p><strong>Altura:</strong> ${paciente.altura} cm</p>
                <p><strong>Sexo:</strong> ${paciente.sexo}</p>
                ${paciente.historiaMedica ? `<a href="${paciente.historiaMedica}" target="_blank">Ver Historia Médica</a>` : ""}
                <button onclick="eliminarPaciente(${index})">Eliminar</button>
            `;
            lista.appendChild(div);
        });
    }
}

// Eliminar paciente
function eliminarPaciente(index) {
    let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    pacientes.splice(index, 1);
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
    cargarPacientes();
}

// **MÉDICO - Visualización y Asignación de Medicamentos**
function cargarPacientesParaMedico() {
    if (document.getElementById("listaPacientesMedico")) {
        const lista = document.getElementById("listaPacientesMedico");
        lista.innerHTML = "";
        let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

        pacientes.forEach((paciente) => {
            let div = document.createElement("div");
            div.textContent = `${paciente.nombre} - ${paciente.tipoSangre}`;
            div.onclick = () => mostrarDetallePaciente(paciente);
            lista.appendChild(div);
        });
    }
}

function mostrarDetallePaciente(paciente) {
    if (document.getElementById("detallePaciente")) {
        const detalle = document.getElementById("infoPaciente");
        const visorPdf = document.getElementById("visorPdf");

        // Mostrar información del paciente
        detalle.innerHTML = `
            <h3>${paciente.nombre}</h3>
            <p><strong>Tipo de Sangre:</strong> ${paciente.tipoSangre}</p>
            <p><strong>Edad:</strong> ${paciente.edad} años</p>
            <p><strong>Altura:</strong> ${paciente.altura} cm</p>
            <p><strong>Sexo:</strong> ${paciente.sexo}</p>
        `;

        // Mostrar el PDF si existe
        if (paciente.historiaMedica) {
            console.log("PDF en Base64:", paciente.historiaMedica); // Depuración
            visorPdf.src = paciente.historiaMedica;
            visorPdf.style.display = "block";
        } else {
            visorPdf.style.display = "none";
        }
    }
}

// **SECRETARIO - Asignación de Citas**
function cargarPacientesParaSecretario() {
    if (document.getElementById("seleccionarPaciente")) {
        let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
        const seleccionarPaciente = document.getElementById("seleccionarPaciente");
        seleccionarPaciente.innerHTML = "";

        pacientes.forEach(paciente => {
            let option = document.createElement("option");
            option.value = paciente.nombre;
            option.textContent = paciente.nombre;
            seleccionarPaciente.appendChild(option);
        });
    }
}

if (document.getElementById("formCita")) {
    document.getElementById("formCita").addEventListener("submit", function(event) {
        event.preventDefault();
        const paciente = document.getElementById("seleccionarPaciente").value;
        const doctor = document.getElementById("doctorAsignado").value;
        const fecha = document.getElementById("fechaCita").value;
        const hora = document.getElementById("horaCita").value;

        if (!fecha || !hora) {
            alert("Por favor, selecciona una fecha y hora.");
            return;
        }

        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas.push({ paciente, doctor, fecha, hora });
        localStorage.setItem("citas", JSON.stringify(citas));

        alert("Cita asignada correctamente.");
        this.reset();
        cargarCitas();
    });
}

function cargarCitas() {
    if (document.getElementById("listaCitas")) {
        const lista = document.getElementById("listaCitas");
        lista.innerHTML = "";
        let citas = JSON.parse(localStorage.getItem("citas")) || [];

        citas.forEach((cita, index) => {
            let div = document.createElement("div");
            div.innerHTML = `
                <p><strong>Paciente:</strong> ${cita.paciente}</p>
                <p><strong>Doctor:</strong> ${cita.doctor}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <button onclick="eliminarCita(${index})">Eliminar</button>
            `;
            lista.appendChild(div);
        });
    }
}

function eliminarCita(index) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas.splice(index, 1);
    localStorage.setItem("citas", JSON.stringify(citas));
    cargarCitas();
}