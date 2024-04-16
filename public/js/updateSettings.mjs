import { showAlert } from "./alerts.mjs";

export const updateData = async (data, type) => {
  try {
    const url =
      type === "data"
        ? "http://127.0.0.1:3000/api/v1/users/updateMe"
        : "http://127.0.0.1:3000/api/v1/users/updatePassword";
    const response = await fetch(url, {
      method: "PATCH",
      body: data,
    });
    const res = await response.json();
    console.log(res);
    if (res.status === "success") {
      showAlert("success", "Settings updated!");
      //setTimeout(() => location.reload(true), 1000);
    } else {
      showAlert("error", res.msg);
    }
  } catch (e) {
    console.log(e);
  }
};

const userDataForm = document.querySelector(".form-user-data");
if (userDataForm)
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    await updateData(form, "data");
  });

const userPasswordForm = document.querySelector(".form-user-password");
if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateData(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    document.getElementById("password-current").textContent = "";
    document.getElementById("password").textContent = "";
    document.getElementById("password-confirm").textContent = "";
  });
