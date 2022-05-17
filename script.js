const http = require("http")
const fs = require("fs")
const url = require("url")
const enviar = require("./mailer")
const { v4: uuidv4 } = require("uuid") // para generar id único
const axios = require("axios")

const getData = async () => {
  const { data } = await axios.get("https://mindicador.cl/api")
  const valorDolar = data.dolar.valor
  const valorEuro = data.euro.valor
  const valorUf = data.uf.valor
  const valorUtm = data.utm.valor
  const mensaje = `\n El valor del dolar el día de hoy es: ${valorDolar}\n El valor del euro el día de hoy es: ${valorEuro}\n El valor del UF el día de hoy es: ${valorUf}\n El valor del UTM el día de hoy es: ${valorUtm}`
  return mensaje
}

getData().then((data) => {
  console.log(data)
})

// Servidor
http
  .createServer(function (req, res) {
    let { para, asunto, contenido } = url.parse(req.url, true).query
    if (req.url === "/") {
      res.setHeader("content-type", "text/html")
      fs.readFile("index.html", "utf8", (err, html) => {
        res.end(html)
      })
    }
    if (req.url.startsWith("/correos")) {
      if (para) {
        enviar(para.split(","), asunto, contenido + mensaje)
          .then((data) => {
            fs.writeFile(
              `./para/${uuidv4()}.txt`,
              `${contenido + mensaje}`,
              (err) => {
                if (err) console.log(err)
                else console.log("Archivo creado")
              }
            )
          })
          .catch((err) => {
            res.end(`Error al enviar el correo: ${err}`)
          })
      }
    } else {
      res.end("Debes ingresar un correo o una contraseña válida")
    }
    res.end("Correo enviado")
  })

  .listen(3000, () => console.log("Server on"))
