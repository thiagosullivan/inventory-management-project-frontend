const currentHour = new Date().getHours();
export let greeting = "";

if (currentHour >= 5 && currentHour < 12) {
  greeting = "Good morning";
} else if (currentHour >= 12 && currentHour < 18) {
  greeting = "Good afternoon";
} else {
  greeting = "Good evening";
}
