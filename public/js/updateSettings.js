const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// here data is for name and email and type is for password
const updateSettings = async (data, type) => {
  try{
    const url = type === 'password' ? '/api/v1/users/updateMyPassword ' : '/api/v1/users/updateMe' ;

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()} Updated Successfully`);
    }
  } catch(err){
    showAlert('error', err.response.data.message);
  }
}

if(userDataForm){
  userDataForm.addEventListener('submit', e =>{
    e.preventDefault();

    // Use this if we only have to pass data not image
    // const name = document.getElementById('name').value ;
    // const email = document.getElementById('email').value ;
    // updateSettings({name, email}, 'data');

    // use this if we have image also in our data
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    
    updateSettings(form, 'data');
  });
}

if(userPasswordForm){
  userPasswordForm.addEventListener('submit', async e =>{
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    
    const passwordCurrent = document.getElementById('password-current').value ;
    const password = document.getElementById('password').value ;
    const confirmPassword = document.getElementById('password-confirm').value ;
    
    await updateSettings({passwordCurrent, password, confirmPassword}, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '' ;
    document.getElementById('password').value = '' ;
    document.getElementById('password-confirm').value = '' ;
  });
}
