const signupForm = document.querySelector('.form--signup');

const signup = async (name, email, password, confirmPassword) =>{
  try{
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data:{
        name,
        email,
        password,
        confirmPassword
      }
    }) 
    if (res.data.status === 'success') {
      showAlert('success', 'Signup Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Singup user
if(signupForm){
  signupForm.addEventListener('submit', e =>{
    e.preventDefault();
    const name = document.getElementById('name').value ;
    const email = document.getElementById('email').value ;
    const password = document.getElementById('password').value ;
    const confirmPassword = document.getElementById('confirmPassword').value ;

    signup(name, email, password, confirmPassword);
  });
}
