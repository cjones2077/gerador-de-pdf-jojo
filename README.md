# gerador-de-pdf-jojo

Comece executando no terminal:

```sh
npm i
```

Altere o arquivo config.json para especificar o caminho da pasta, o nome do .pdf e o título do texto.

```json
{
    "diretorio": "C:/Users/Seu-Usuario/Documents/Codigos/jojo/back-end",
    "saidaPDF": "back-end.pdf",
    "titulo": "LPIII - Entrega 1 - Nome Do Aluno"
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