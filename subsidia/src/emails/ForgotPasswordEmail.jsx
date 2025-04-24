import * as React from 'react';
import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Html,
   Link,
   Preview,
   Section,
   Text,
   Tailwind,
} from '@react-email/components';
import { config } from '@/lib/config';

export const PasswordResetEmail = ({ resetLink }) => {
   return (
      <Html>
         <Head />
         <Preview>Reimposta la tua password</Preview>
         <Tailwind>
            <Body className="bg-gray-100 font-sans py-[40px]">
               <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
                  <Heading className="text-[24px] font-bold text-gray-800 mt-[10px] mb-[24px]">
                     Richiesta di Reimpostazione Password
                  </Heading>

                  <Text className="text-[16px] text-gray-600 mb-[12px]">
                     Abbiamo ricevuto una richiesta di reimpostazione della tua password. Se non hai fatto questa richiesta, puoi tranquillamente ignorare questa email.
                  </Text>

                  <Text className="text-[16px] text-gray-600 mb-[24px]">
                     Per reimpostare la tua password, clicca sul pulsante qui sotto:
                  </Text>

                  <Section className="text-center mb-[32px]">
                     <Button
                        href={resetLink}
                        className="bg-blue-600 text-white px-[20px] py-[12px] rounded-[4px] font-medium no-underline text-center box-border"
                     >
                        Reimposta Password
                     </Button>
                  </Section>

                  <Text className="text-[14px] text-gray-600 mb-[12px]">
                     Se il pulsante non funziona, copia e incolla questo link nel tuo browser:
                  </Text>

                  <Text className="text-[14px] text-blue-600 mb-[32px] break-all">
                     <Link href={resetLink} className="text-blue-600 no-underline">
                        {resetLink}
                     </Link>
                  </Text>

                  <Text className="text-[14px] text-gray-600 mb-[8px]">
                     Questo link per la reimpostazione della password scadrà tra 24 ore.
                  </Text>

                  <Text className="text-[14px] text-gray-600 mb-[32px]">
                     Se hai bisogno di aiuto, contatta il nostro team di supporto.
                  </Text>

                  <Section className="border-t border-gray-200 pt-[16px] text-[12px] text-gray-500">
                     <Text className="m-0">
                        © {new Date().getFullYear()} {config.appName}. Tutti i diritti riservati.
                     </Text>
                  </Section>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   );
};

export default PasswordResetEmail;