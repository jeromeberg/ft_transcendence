import { Link } from 'react-router-dom';
import { Heading, Text, PageLayout } from '@/components';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { i18n } = useTranslation();
  if (i18n.language === 'en') {
    return (
      <PageLayout maxWidth="max-w-150">
        <div className="flex flex-col gap-4">
          <Heading level={2}>Terms</Heading>
          <Text>
            Thank you for using Typerun. By creating an account and using our services, you agree to
            all the terms below.
          </Text>
          <Heading level={5}>Account management</Heading>
          <Text>
            Your account must be created by an individual. You must be at least 13 years old and
            provide a valid email address. You are responsible for keeping your password
            confidential and for any activity carried out from your account.
          </Text>
          <Heading level={5}>Rules of conduct</Heading>
          <Text>
            Be courteous with other players. Harassment, hateful, racist, sexist or discriminatory
            remarks are in no way tolerated.
          </Text>
          <Heading level={5}>User content</Heading>
          <Text>
            You are solely responsible for the username you choose and the messages you send. We
            reserve the right to modify or remove any content that violates these terms.
          </Text>
          <Heading level={5}>Cheating</Heading>
          <Text>
            The use of bots, scripts or any other tool automating input is prohibited, under penalty
            of invalidated scores or even a ban from the leaderboard.
          </Text>
          <Heading level={5}>Intellectual property</Heading>
          <Text>
            The game, its code, its design and its content belong to Typerun. The user may not in
            any case copy, redistribute or modify the game.
          </Text>
          <Heading level={5}>Service availability</Heading>
          <Text>
            Typerun does not guarantee 24/7 availability due to possible maintenance and outages. We
            are not responsible in case of loss of progress related to a technical incident.
          </Text>
          <Heading level={5}>Limitation of liability</Heading>
          <Text>
            Typerun is provided "as is", without warranty of any kind. We cannot be held liable for
            indirect damages resulting from the use of the service.
          </Text>
          <Heading level={5}>Applicable law</Heading>
          <Text>
            These terms are subject to French law. Any dispute will be brought before the competent
            courts.
          </Text>
          <Text>
            To learn more about the privacy of your data,{' '}
            <Link to="/privacy" className="hover:text-glow">
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
          <Heading level={2}>Conditions</Heading>
          <Text>
            Merci d'utiliser Typerun. En créant un compte et en utilisant nos services, vous
            acceptez l'intégralité des conditions ci-dessous.
          </Text>
          <Heading level={5}>Gestion du compte</Heading>
          <Text>
            Votre compte doit être créé par une personne physique. Vous devez avoir au minimum 13
            ans et fournir une adresse e-mail valide. Vous êtes responsable de la confidentialité de
            votre mot de passe et de toute activité effectuée depuis votre compte.
          </Text>
          <Heading level={5}>Règles de conduite</Heading>
          <Text>
            Restez courtois avec les autres joueurs. Le harcèlement, les propos haineux, racistes,
            sexistes ou discriminatoires ne sont en aucun cas tolérés.
          </Text>
          <Heading level={5}>Contenu utilisateur</Heading>
          <Text>
            Vous êtes seul responsable du pseudo que vous choisissez et des messages que vous
            envoyez. Nous nous réservons le droit de modifier ou supprimer tout contenu enfreignant
            les présentes conditions.
          </Text>
          <Heading level={5}>Triche</Heading>
          <Text>
            L'utilisation de bots, scripts ou tout autre outil automatisant la saisie est interdite,
            sous peine de score invalidé voire bannissement du leaderboard.
          </Text>
          <Heading level={5}>Propriété intellectuelle</Heading>
          <Text>
            Le jeu, son code, son design et ses contenus appartiennent à Typerun. L'utilisateur ne
            peut en aucun cas copier, redistribuer ou modifier le jeu.
          </Text>
          <Heading level={5}>Disponibilité du service</Heading>
          <Text>
            Typerun ne garantit pas une disponibilité 24/7 en raison des possibles maintenances et
            pannes. Nous ne sommes pas responsables en cas de perte de progression liée à un
            incident technique.
          </Text>
          <Heading level={5}>Limitation de responsabilité</Heading>
          <Text>
            Typerun est fourni « tel quel », sans garantie d'aucune sorte. Nous ne saurions être
            tenus responsables des dommages indirects résultant de l'utilisation du service.
          </Text>
          <Heading level={5}>Droit applicable</Heading>
          <Text>
            Les présentes conditions sont soumises au droit français. Tout litige sera porté devant
            les tribunaux compétents.
          </Text>
          <Text>
            Pour en savoir plus sur la confidentialité de vos données,{' '}
            <Link to="/privacy" className="hover:text-glow">
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
          <Heading level={2}>Condiciones</Heading>
          <Text>
            Gracias por utilizar Typerun. Al crear una cuenta y utilizar nuestros servicios, aceptas
            la totalidad de las condiciones que se indican a continuación.
          </Text>
          <Heading level={5}>Gestión de la cuenta</Heading>
          <Text>
            Tu cuenta debe ser creada por una persona física. Debes tener al menos 13 años y
            proporcionar una dirección de correo electrónico válida. Eres responsable de la
            confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.
          </Text>
          <Heading level={5}>Normas de conducta</Heading>
          <Text>
            Sé cortés con los demás jugadores. El acoso y los comentarios de odio, racistas,
            sexistas o discriminatorios no se toleran en ningún caso.
          </Text>
          <Heading level={5}>Contenido del usuario</Heading>
          <Text>
            Eres el único responsable del alias que elijas y de los mensajes que envíes. Nos
            reservamos el derecho de modificar o eliminar cualquier contenido que infrinja las
            presentes condiciones.
          </Text>
          <Heading level={5}>Trampas</Heading>
          <Text>
            El uso de bots, scripts o cualquier otra herramienta que automatice la escritura está
            prohibido, bajo pena de invalidación de la puntuación o incluso expulsión de la
            clasificación.
          </Text>
          <Heading level={5}>Propiedad intelectual</Heading>
          <Text>
            El juego, su código, su diseño y sus contenidos pertenecen a Typerun. El usuario no
            puede en ningún caso copiar, redistribuir ni modificar el juego.
          </Text>
          <Heading level={5}>Disponibilidad del servicio</Heading>
          <Text>
            Typerun no garantiza una disponibilidad 24/7 debido a posibles mantenimientos y averías.
            No somos responsables en caso de pérdida de progreso vinculada a un incidente técnico.
          </Text>
          <Heading level={5}>Limitación de responsabilidad</Heading>
          <Text>
            Typerun se proporciona «tal cual», sin garantía de ningún tipo. No podemos ser
            considerados responsables de los daños indirectos derivados del uso del servicio.
          </Text>
          <Heading level={5}>Legislación aplicable</Heading>
          <Text>
            Las presentes condiciones se rigen por el derecho francés. Cualquier litigio será
            sometido a los tribunales competentes.
          </Text>
          <Text>
            Para saber más sobre la privacidad de tus datos,{' '}
            <Link to="/privacy" className="hover:text-glow">
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
