<h3> Deploying with Github Actions to gh-pages <h3>
<code>

    name: Build & deploy

    on:
    push:
        branches:
        - master
    pull_request:
        branches:
        - master

    jobs:
    build:
        name: Build
        runs-on: ubuntu-latest
        
        steps:
        - name: Checkout code
        uses: actions/checkout@v2
        
        - name: Install Node.js
        uses: actions/setup-node@v1
        with:
            node-version: 13.x
        
        - name: Install NPM packages
        run: npm ci
        
        - name: Build project
        run: npm run build
        
        - name: Run tests
        run: npm run test

        - name: Upload production-ready build files
        uses: actions/upload-artifact@v2
        with:
            name: production-files
            path: ./build
    
    deploy:
        name: Deploy
        needs: build
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'
        
        steps:
        - name: Download artifact
        uses: actions/download-artifact@v2
        with:
            name: production-files
            path: ./build

        - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v3
        with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./build
</code>

<p>Github will automatically generate a <code> secrets.GITHUB_TOKEN </code></p>
<p>When deploying with Github Pages, add the followng configuration to the <code>package.json</code>
    <br> 
    <code>"homepage": "https://username.github.io/repo-name/",</code>
    <br>
    This <code> homepage</code> value will change depending on whether you are deploying to Github Pages or your own remote VPS. Essentially the homepage will be the deploymet URL of the app. Setting this value in the <code>package.json</code> for local deployment will break the app. I still need to figure out how to set it dynamically through <code> npm scripts </code> and <code>PUBLIC_URL</code> environment variable. 
    <br>
    If you are not deploying through Github Pages, then you needn't bother with the <code>homepage</code>
    You can also deploy the build directory of the app using any other method such as <code>python3 -m http.server 3000 </code>. In that case you wont be using the Github Actions for gh-pages but instead you would use SSH keys to <code>rsync</code> between the Github Servers and your remote VPS and then serve the static <code>build</code> files through Nginx/Apache.