ZEPHYR SIDEPANEL

run localy  nx run my-app:serve (but commit chrome events before)
to check in chrome, use load unpacked button in chrome extensions (developer mode). Upload dist folder.

Now it use mocked data for app, but there is getAppData method where it can be taken from api

All env values is used for dev env. Also needed run locally zephyr server, needed branch with websocket changes https://github.com/ZephyrCloudIO/zephyr-cloud-io/pull/431

From the start it check accesstoken in storage, then check it is it valid with auth0 api
if accesstoken is not valid should be displayed layout with login button.
It you closed sidepane and open again it will check accesstoken from the start and if it is valid you see main content

In main content is displayed mocked data. Render happens if you change app and tag.
When you change version and remotes status of data becomes not deployed and action buttons become able.
In deployed state action buttons are disabled

select element is custom, because datalis doesn't allow set default value
if you change version without tag remotes updates anyway


Remotes added manually in constantValue.ts for each version(tag)

there is commented code which can be useful, so i didn't remove it (code regarding chrome events)

can be added new tags, when you input tag which isn't in option list you can press enter and eventHadler newTagCreatedCallback will be triggered

Also current inf saves in storage and if session keeps it it will be checked from the start
