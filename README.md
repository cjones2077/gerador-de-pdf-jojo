# gerador-de-pdf-jojo

Comece executando no terminal:

```sh
npm i
```

Altere o arquivo config.json para especificar o caminho da pasta, o caminho de saída dos .pdf e o título do texto.
Aqui eu estou supondo que seu back-end e seu front-end estejam na mesma pasta, no caso ilustrada pela "entrega3".

```json
{
    "diretorio": "diretorio/da/entrega3",
    "dirSaida": "diretorio/de/saida",
    "titulo": "LPIII - Entrega x - Nome Do Aluno"
}
```

Para executar e gerar o .pdf, basta rodar o comando no terminal:

```sh
npm start
```
 ## Importante

 Edite o arquivo .ignore para especificar quais pastas, subpastas e arquivos não devem ser lidos pelo código. Pastas são escritas sem extensão, arquivos precisam da extensão.

Conteúdo do arquivo .ignore
 ```
.example
package.json
tsconfig.json
yarn.lock
node_modules
ormconfig.ts
 ```
