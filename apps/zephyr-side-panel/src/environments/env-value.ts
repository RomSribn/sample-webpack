export interface Environment {
  readonly production: boolean;
  readonly AUTH0_CLIENT_ID: string;
  readonly AUTH0_DOMAIN: string;
  readonly ZEPHYR_API_ENDPOINT: string;
}

let _env: Environment;

const envValue = {
  get value(): Environment {
    return _env;
  },

  set value(value: Environment) {
    _env = value;
  },
};

export { envValue };
