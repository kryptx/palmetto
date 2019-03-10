$( document ).ready(function() {
  loadProfile();
});

function getLocalProfile(callback){
  var profileImgSrc      = localStorage.getItem("PROFILE_IMG_SRC");
  var profileName        = localStorage.getItem("PROFILE_NAME");
  var profileReAuthEmail = localStorage.getItem("PROFILE_REAUTH_EMAIL");

  if(profileName !== null
          && profileReAuthEmail !== null
          && profileImgSrc !== null) {
      callback(profileImgSrc, profileName, profileReAuthEmail);
  }
}

function loadProfile() {
  if(!supportsHTML5Storage()) { return false; }
  // we have to provide to the callback the basic
  // information to set the profile
  getLocalProfile(function(profileImgSrc, profileName, profileReAuthEmail) {
      //changes in the UI
      $("#profile-img").attr("src",profileImgSrc);
      $("#profile-name").html(profileName);
      $("#reauth-email").html(profileReAuthEmail);
      $("#inputEmail").hide();
      $("#remember").hide();
  });
}

/**
* function that checks if the browser supports HTML5
* local storage
*
* @returns {boolean}
*/
function supportsHTML5Storage() {
  try {
      return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
      return false;
  }
}
