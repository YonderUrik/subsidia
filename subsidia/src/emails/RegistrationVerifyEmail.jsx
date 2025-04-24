import * as React from 'react';
import {
   Body,
   Container,
   Head,
   Heading,
   Html,
   Preview,
   Section,
   Text,
   Tailwind,
   Hr,
} from '@react-email/components';
import { config } from '@/lib/config';

export const VerificationEmail = ({ verificationCode }) => {
   return (
      <Html>
         <Head />
         <Preview>Il tuo codice di verifica è: {verificationCode}</Preview>
         <Tailwind>
            <Body className="bg-gray-100 font-sans py-[40px]">
               <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
                  <Section>
                     <Heading className="text-[24px] font-bold text-gray-800 mt-[20px] mb-[16px]">
                        Verifica il tuo indirizzo email
                     </Heading>
                     <Text className="text-[16px] text-gray-600 mb-[24px]">
                        Grazie per esserti registrato! Utilizza il codice di verifica qui sotto per completare la registrazione.
                     </Text>

                     <Section className="bg-gray-50 rounded-[8px] py-[20px] px-[24px] text-center my-[24px]">
                        <Text className="text-[32px] font-bold tracking-[4px] text-gray-800 m-0">
                           {verificationCode}
                        </Text>
                     </Section>

                     <Text className="text-[16px] text-gray-600 mb-[24px]">
                        Questo codice scadrà tra 1 ora. Se non hai richiesto questa verifica, puoi tranquillamente ignorare questa email.
                     </Text>

                  </Section>

                  <Hr className="border-gray-200 my-[24px]" />

                  <Section>
                     <Text className="text-[12px] text-gray-500 m-0">
                        © {new Date().getFullYear()} {config.appName}. Tutti i diritti riservati.
                     </Text>
                  </Section>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   );
};

export default VerificationEmail;