const currentHour = new Date().getHours();
export let greeting = "";

if (currentHour >= 5 && currentHour < 12) {
  greeting = "Bom dia";
} else if (currentHour >= 12 && currentHour < 18) {
  greeting = "Boa tarde";
} else {
  greeting = "Boa noite";
}
