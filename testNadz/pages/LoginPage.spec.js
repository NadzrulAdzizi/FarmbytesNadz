export class LoginPage {
    constructor(driver) {
      this.driver = driver;
  
      // Locators
      this.chromeApp = "accessibility id:Chrome";
      this.urlBar = "id:com.android.chrome:id/url_bar";
      this.goButton = "id:com.android.chrome:id/line_2";
      this.emailField = '-android uiautomator:new UiSelector().className("android.widget.EditText").instance(0)';
      this.passwordField = '-android uiautomator:new UiSelector().className("android.widget.EditText").instance(1)';
      this.loginButton = '-android uiautomator:new UiSelector().text("Login")';
    }
  
    // Methods
    async openChrome() {
      const chromeApp = await this.driver.$(this.chromeApp);
      await chromeApp.click();
    }
  
    async navigateToUrl(url) {
      const urlBar = await this.driver.$(this.urlBar);
      await urlBar.click();
      await urlBar.addValue(url);
  
      const goButton = await this.driver.$(this.goButton);
      await goButton.click();
    }
  
    async enterEmail(email) {
      const emailField = await this.driver.$(this.emailField);
      await emailField.click();
      await emailField.addValue(email);
    }
  
    async enterPassword(password) {
      const passwordField = await this.driver.$(this.passwordField);
      await passwordField.click();
      await passwordField.addValue(password);
    }
  
    async clickLogin() {
      const loginButton = await this.driver.$(this.loginButton);
      await loginButton.click();
    }
  
    async login(url, email, password) {
      await this.openChrome();
      await this.navigateToUrl(url);
      await this.enterEmail(email);
      await this.enterPassword(password);
      await this.clickLogin();
    }
  }