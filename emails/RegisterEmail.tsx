import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface RegisterEmailProps {
  userName?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const RegisterEmail = ({
  userName = "Participante",
}: RegisterEmailProps) => (
  <Html>
    <Head />
    <Preview>
      ¡Bienvenido a la Quiniela! Tu registro fue exitoso.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/static/logo.png`}
          width="120"
          height="50"
          alt="Logo Quiniela"
          style={logo}
        />
        <Text style={paragraph}>¡Hola, {userName}!</Text>
        <Text style={paragraph}>
          ¡Felicidades! Te has registrado exitosamente en la Quiniela de la Oficina.
          Estamos muy emocionados de tenerte a bordo.
        </Text>
        <Text style={paragraph}>
          Ahora puedes ver tu registro, los equipos que elegiste y seguir el progreso
          de los demás participantes. ¡Que gane el mejor!
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={baseUrl}>
            Ir a la Quiniela
          </Button>
        </Section>
        <Text style={paragraph}>
          Mucha suerte,
          <br />
          El Comité Organizador
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Quiniela de la Oficina - Un evento para unir a los equipos.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default RegisterEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const logo = {
  margin: "0 auto",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#10b981",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
