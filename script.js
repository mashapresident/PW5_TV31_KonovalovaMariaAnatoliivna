document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("calc-form");
    const output = document.getElementById("output");
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const systemType = document.getElementById("system-type").value;
      const failureRate = parseFloat(document.getElementById("failure-rate").value);
      const repairTime = parseFloat(document.getElementById("repair-time").value);
      const plannedRepairTime = parseFloat(document.getElementById("planned-repair-time").value);
  
      if (failureRate <= 0 || repairTime <= 0 || (plannedRepairTime !== 0 && plannedRepairTime <= 0)) {
        output.textContent = "Всі значення повинні бути більшими за 0!";
        return;
      }
  
      // Завантаження даних про попередні відмови з JSON
      const jsonData = await fetch('data.json')
        .then(response => response.json())
        .catch(err => {
          console.error("Помилка завантаження даних:", err);
          output.textContent = "Не вдалося завантажити дані.";
          return;
        });
  
      let failureCoefficient = 0;
  
      if (jsonData && jsonData.failureData) {
        // Обчислення коефіцієнта на основі попередніх відмов
        failureCoefficient = jsonData.failureData.reduce((acc, item) => {
          return acc + item.failureRate * item.repairTime;
        }, 0);
      } else {
        output.textContent = "Дані про відмови відсутні.";
        return;
      }
  
      let reliability, plannedDowntime;
  
      if (systemType === "single") {
        reliability = failureRate * repairTime;
        plannedDowntime = 1.2 * (plannedRepairTime / 8760);
      } else if (systemType === "double") {
        reliability = failureCoefficient; 
        plannedDowntime = 0; 
      }
  
      output.textContent = `
        Надійність: ${reliability.toFixed(4)}. 
        Плановий простій: ${plannedDowntime.toFixed(4)}.
      `;
    });
  });
  