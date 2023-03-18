const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

const login = async (email, password) =>{
  try{
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data:{
        email,
        password
      }
    }) 
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const logout = async () => {
  try{
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    })

    if (res.data.status === 'success') location.assign('/');

  }catch(err){
    showAlert('error', 'Error in logging out! Try again later.')
  }
}

// logging in user
if(loginForm){
  loginForm.addEventListener('submit', e =>{
    e.preventDefault();
    const email = document.getElementById('email').value ;
    const password = document.getElementById('password').value ;
    login(email, password);
  });
}

// logged out User
if(logOutBtn) {
  logOutBtn.addEventListener('click', logout)
}

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};