let userDarkMode = localStorage.getItem('darkMode');
var slider = document.getElementById('myCheckbox');

const toggleDarkMode = () => localStorage.setItem('darkMode', 'onDark')

if (userDarkMode === 'darkMode') toggleDarkMode();

const toggleLightMode = () => localStorage.setItem('darkMode', null);

// slider.addEventListener('click', () => {
//     userDarkMode = localStorage.getItem('darkMode');
//     if (userDarkMode !== 'onDark' && slider.checked ) toggleDarkMode()
//     else toggleLightMode();
// });


