document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
    var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => addTaskToDOM(task.text, task.checked));
}

// Función para añadir una nueva tarea
function newElement() {
    var input = document.getElementById("myInput");
    var inputValue = input.value.trim();

    if (inputValue === "") {
        alert("¡Debes escribir algo!");
        return;
    }

    addTaskToDOM(inputValue, false);
    saveTasks();
    input.value = "";
}

// Función para agregar una tarea al DOM
function addTaskToDOM(text, checked) {
    var li = document.createElement("li");
    li.textContent = text;
    
    if (checked) {
        li.classList.add("checked");
    }

    // Botón de eliminar
    var span = document.createElement("SPAN");
    span.className = "close";
    span.innerHTML = "\u00D7";
    span.onclick = function() {
        li.remove();
        saveTasks();
    };
    
    li.appendChild(span);
    li.onclick = function() {
        li.classList.toggle("checked");
        saveTasks();
    };

    document.getElementById("myUL").appendChild(li);
}

// Guarda las tareas en localStorage
function saveTasks() {
    var tasks = [];
    document.querySelectorAll("#myUL li").forEach(li => {
        tasks.push({ text: li.textContent.replace("\u00D7", "").trim(), checked: li.classList.contains("checked") });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
