export class ContentClass {
  static loginContent() {
    return `
        <button id="login-btn">login</button>
      `;
  }

  static mainContent(title) {
    return `<p>You are in, success and checl variable ${title}</p>`
  }

  static getContent(isAccessToken: boolean): string {
    return isAccessToken ? this.mainContent('test 12345567889') : this.loginContent();
  }
}
