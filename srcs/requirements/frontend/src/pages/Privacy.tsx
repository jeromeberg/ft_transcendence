import { Link } from 'react-router-dom';
import { Heading, Text, PageLayout } from '@/components';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { i18n } = useTranslation();
  if (i18n.language === 'en') {
    return (
      <PageLayout maxWidth="max-w-150">
        <div className="flex flex-col gap-4">
          <Heading level={2}>Privacy</Heading>
          <Text>
            Your data belongs to you. Here is what we collect, why, and how you stay in control.
          </Text>
          <Heading level={5}>Your data</Heading>
          <Text>
            When you create an account, the data collected is: username, email address and password
            (hidden). The other data gathered afterwards is: game statistics, match history, IP
            addresses, browser used, logs, friend list and friend requests sent/received.
          </Text>
          <Heading level={5}>Use of your data</Heading>
          <Text>
            Your data is only used to operate the service: display the real-time leaderboard, secure
            your connections, manage the friend system, send messages and improve the gameplay
            experience. No data is used for advertising or profiling purposes.
          </Text>
          <Heading level={5}>Security</Heading>
          <Text>
            Your password is hashed before storage and is never transmitted nor accessible in plain
            text. All communications with the server are encrypted via HTTPS.
          </Text>
          <Heading level={5}>Sharing with third parties</Heading>
          <Text>We never sell your data under any circumstances.</Text>
          <Heading level={5}>Minors</Heading>
          <Text>
            People under 13 are not allowed to register. We do not wish to knowingly collect their
            data.
          </Text>
          <Text>
            To learn more about our terms of use,{' '}
            <Link to="/terms" className="hover:text-glow">
              click here
            </Link>
          </Text>
          <Text variant="dim">
            <i>Last updated on May 29, 2026</i>
          </Text>
        </div>
      </PageLayout>
    );
  } else if (i18n.language === 'fr') {
    return (
      <PageLayout maxWidth="max-w-150">
        <div className="flex flex-col gap-4">
          <Heading level={2}>Confidentialité</Heading>
          <Text>
            Vos données vous appartiennent. Voici ce que nous collectons, pourquoi, et comment vous
            gardez le contrôle.
          </Text>
          <Heading level={5}>Vos données</Heading>
          <Text>
            Lorsque vous créez un compte, les données collectées sont : nom d'utilisateur, adresse
            e-mail et mot de passe (masqué). Les autres données recueillies par la suite sont : les
            statistiques de jeu, l'historique des parties, les adresses IP, le navigateur utilisé,
            les logs, la liste d'amis et les demandes d'amis envoyées/reçues.
          </Text>
          <Heading level={5}>Utilisation de vos données</Heading>
          <Text>
            Vos données nous servent uniquement à faire fonctionner le service : afficher le
            leaderboard en temps réel, sécuriser vos connexions, gérer le système d'amis, l'envoi de
            messages et améliorer l'expérience de jeu. Aucune donnée n'est utilisée à des fins
            publicitaires ou de profilage.
          </Text>
          <Heading level={5}>Sécurité</Heading>
          <Text>
            Votre mot de passe est haché avant stockage et n'est jamais transmis ni accessible en
            clair. Toutes les communications avec le serveur sont chiffrées via HTTPS.
          </Text>
          <Heading level={5}>Partage avec des tiers</Heading>
          <Text>Nous ne vendons vos données en aucun cas.</Text>
          <Heading level={5}>Mineurs</Heading>
          <Text>
            Les personnes ayant moins de 13 ans ne sont pas autorisées à s'inscrire. Nous ne
            souhaitons pas recueillir volontairement leurs données.
          </Text>
          <Text>
            Pour en savoir plus sur nos conditions d'utilisation,{' '}
            <Link to="/terms" className="hover:text-glow">
              cliquez ici
            </Link>
          </Text>
          <Text variant="dim">
            <i>Dernière mise à jour le 29 mai 2026</i>
          </Text>
        </div>
      </PageLayout>
    );
  } else {
    return (
      <PageLayout maxWidth="max-w-150">
        <div className="flex flex-col gap-4">
          <Heading level={2}>Privacidad</Heading>
          <Text>
            Tus datos te pertenecen. Aquí te explicamos qué recopilamos, por qué, y cómo mantienes
            el control.
          </Text>
          <Heading level={5}>Tus datos</Heading>
          <Text>
            Cuando creas una cuenta, los datos recopilados son: nombre de usuario, dirección de
            correo electrónico y contraseña (oculta). Los demás datos recopilados posteriormente
            son: las estadísticas de juego, el historial de partidas, las direcciones IP, el
            navegador utilizado, los registros, la lista de amigos y las solicitudes de amistad
            enviadas/recibidas.
          </Text>
          <Heading level={5}>Uso de tus datos</Heading>
          <Text>
            Tus datos se utilizan únicamente para hacer funcionar el servicio: mostrar la
            clasificación en tiempo real, asegurar tus conexiones, gestionar el sistema de amigos,
            el envío de mensajes y mejorar la experiencia de juego. Ningún dato se utiliza con fines
            publicitarios ni de perfilado.
          </Text>
          <Heading level={5}>Seguridad</Heading>
          <Text>
            Tu contraseña se cifra antes del almacenamiento y nunca se transmite ni es accesible en
            texto plano. Todas las comunicaciones con el servidor están cifradas mediante HTTPS.
          </Text>
          <Heading level={5}>Compartición con terceros</Heading>
          <Text>No vendemos tus datos bajo ninguna circunstancia.</Text>
          <Heading level={5}>Menores</Heading>
          <Text>
            Las personas menores de 13 años no están autorizadas a registrarse. No deseamos
            recopilar voluntariamente sus datos.
          </Text>
          <Text>
            Para saber más sobre nuestras condiciones de uso,{' '}
            <Link to="/terms" className="hover:text-glow">
              haz clic aquí
            </Link>
          </Text>
          <Text variant="dim">
            <i>Última actualización el 29 de mayo de 2026</i>
          </Text>
        </div>
      </PageLayout>
    );
  }
}
