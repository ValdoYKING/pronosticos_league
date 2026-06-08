import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import RegisterEmail from "@/emails/RegisterEmail";
import AccessCodeEmail from "@/emails/AccessCodeEmail";

// Verificar que la API key existe
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("ERROR: RESEND_API_KEY no está configurada en las variables de entorno");
}

const resend = new Resend(apiKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { to, subject, userName, accessCode } = req.body;

      if (!to || !subject || !userName) {
        return res.status(400).json({ error: "Faltan parámetros en el cuerpo de la solicitud" });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "RESEND_API_KEY no está configurada. Revisa el archivo .env",
          details: "Agrega tu API key de Resend en el archivo .env como RESEND_API_KEY=re_..."
        });
      }

      console.log(`[send-email] Intentando enviar correo a: ${to}`);

      // El dominio ya está verificado en Resend, usamos el remitente personalizado
      const fromEmail = "Quiniela de la Oficina <noreply@pronosticosleague.website>";

      console.log(`[send-email] Desde: ${fromEmail}`);

      // Elegir el template según si es código de acceso o registro
      const emailReact = accessCode 
        ? AccessCodeEmail({ userName, accessCode })
        : RegisterEmail({ userName });

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        react: emailReact,
      });

      if (error) {
        console.error("Error al enviar email - Respuesta de Resend:", error);
        
        // Errores comunes de Resend
        let userMessage = "Error al enviar el correo";
        const errorName = String(error.name);
        if (errorName === "restricted_api_key") {
          userMessage = "La API key de Resend no tiene permisos para enviar a este destinatario. Usa una API key de producción o verifica tu dominio.";
        } else if (errorName === "domain_not_verified") {
          userMessage = "El dominio pronosticosleague.website no está verificado en Resend. Agrega los registros DNS requeridos en tu proveedor de dominio.";
        } else if (error.message?.includes("sandbox")) {
          userMessage = "Estás usando el modo sandbox de Resend. Solo puedes enviar correos a tu propia dirección verificada.";
        }

        return res.status(500).json({ 
          error: userMessage, 
          details: error.message || JSON.stringify(error),
          name: error.name
        });
      }

      console.log("Correo enviado exitosamente:", data?.id);
      res.status(200).json({ message: "Correo enviado exitosamente", data });
    } catch (error) {
      console.error("Error en el manejador de la API:", error);
      res.status(500).json({ 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
