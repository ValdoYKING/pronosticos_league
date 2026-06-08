import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AccessCodeEmailProps {
  userName?: string;
  accessCode?: string;
}

export const AccessCodeEmail = ({
  userName = "Participante",
  accessCode = "000000",
}: AccessCodeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>🔑 Código de Acceso</Text>
        <Text style={paragraph}>Hola, {userName}.</Text>
        <Text style={paragraph}>
          Has solicitado acceder a tu registro en la Quiniela de la Oficina.
          Utiliza el siguiente código para ingresar:
        </Text>

        <Section style={codeContainer}>
          <Text style={codeText}>{accessCode}</Text>
        </Section>

        <Text style={paragraph}>
          Este código es válido por <strong>10 minutos</strong>.
          Si no solicitaste este código, ignora este mensaje.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Quiniela de la Oficina - Un evento para unir a los equipos.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AccessCodeEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "480px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  color: "#10b981",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#334155",
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  border: "2px solid #10b981",
};

const codeText = {
  fontSize: "36px",
  fontWeight: "bold" as const,
  letterSpacing: "8px",
  color: "#059669",
  fontFamily: "monospace",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center" as const,
};
