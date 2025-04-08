document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("calc-form");
    const output = document.getElementById("output");
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const failureRate = parseFloat(document.getElementById("failure-rate").value);
      const repairTime = parseFloat(document.getElementById("repair-time").value);
      const plannedRepairTime = parseFloat(document.getElementById("planned-repair-time").value);
      const systemType = document.getElementById("system-type").value;
  
      // Перевірка на додатність значень
      if (failureRate <= 0 || repairTime <= 0 || (plannedRepairTime !== 0 && plannedRepairTime <= 0)) {
        output.textContent = "Всі значення повинні бути більшими за 0!";
        return;
      }
  
      // Завантаження даних із JSON
      const jsonData = await fetch('data.json')
        .then(response => response.json())
        .catch(err => {
          console.error("Помилка завантаження даних:", err);
          output.textContent = "Не вдалося завантажити дані.";
          return;
        });
  
      if (!jsonData || !jsonData.failureData) {
        output.textContent = "Дані відсутні.";
        return;
      }
  
      // Розрахунок параметрів для одноколової системи
      const singleSystemData = jsonData.failureData.reduce(
        (acc, item) => {
          acc.failureRate += item.failureRate;
          acc.totalRepairTime += item.failureRate * item.repairTime;
          return acc;
        },
        { failureRate: 0, totalRepairTime: 0 }
      );
  
      const singleSystemFailureRate = singleSystemData.failureRate;
      const singleSystemAvgRepairTime = singleSystemData.totalRepairTime / singleSystemFailureRate;
  
      let reliability, plannedDowntime;
  
      if (systemType === "single") {
        reliability = singleSystemFailureRate * singleSystemAvgRepairTime;
        plannedDowntime = 1.2 * (plannedRepairTime / 8760);
      } else if (systemType === "double") {
        const doubleSystemFailureRate =
          2 * singleSystemFailureRate * (3.6e-4 + 58.9e-4) + jsonData.sectionBreakerFailureRate;
  
        reliability = doubleSystemFailureRate;
        plannedDowntime = 0; // У двоколовій системі плановий простій практично відсутній
      }
  
      output.textContent = `
        Частота відмов системи: ${reliability.toFixed(4)} рік⁻¹.
        Плановий простій: ${plannedDowntime.toFixed(4)} років.
      `;
    });
  });
  
