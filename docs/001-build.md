On build start, package

1. authentication - todo

- read token with `node-persist`
- if no token - run login auth flow
- check - can I deploy this application and store ([full_app_name, token] pare to deploy)

2. read app config from API for this Application

- edge point url
- shared libs config

3. read federation config (exposes and/or remotes)

4. resolve remote app names into URIs

- names could be local

known issue:

- `import` keyword got replaced in delegate function

release:

- publish cli
- publish webpack package
- publish npm lib

- publish worker(s)
-
