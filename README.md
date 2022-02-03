# node-starter

### Development setup

- development

```
cp .env.example .env
docker-compose up
prisma migrate dev --name init
npm run dev
```

### Linting

To keep the code consistent, use the built-in prettier and eslint.

```
Jetbrains IDE > Settings / Preferences > Plugins > Prettier
Visual Studio Code > Plugins > Prettier
```

Automatic code formatting

```
npm run format-all
```

Prettier, eslint and typescript code check

```
npm run check-all
```
