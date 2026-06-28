import { useState, useEffect, useReducer, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyD6sLv85OSBJuZpqnNS2kcEoS-Ca5FEm5c",
  authDomain: "pronostic-mondial.firebaseapp.com",
  databaseURL: "https://pronostic-mondial-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pronostic-mondial",
  storageBucket: "pronostic-mondial.firebasestorage.app",
  messagingSenderId: "838624034284",
  appId: "1:838624034284:web:a712dcd70dde4f804fd4c9"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PLAYERS = ["Vincent", "Samuel", "Thomas", "Denis", "Mika", "Laurent", "Gabin", "Raph", "Olivier S", "Olivier G", "Julien", "Paco"];
const PALETTE = ["#22d3ee","#a78bfa","#f472b6","#34d399","#fb923c","#818cf8","#facc15","#f87171","#4ade80","#38bdf8","#c084fc","#f97316"];
const getPlayerColor = (p) => PALETTE[PLAYERS.indexOf(p) % PALETTE.length];

// Verrouillage meilleur buteur : avant le 1er match des 16es (28 juin 21h)
const TOP_SCORER_DEADLINE = new Date("2026-06-28T21:00:00+02:00");
const isTopScorerLocked = () => new Date() >= TOP_SCORER_DEADLINE;

// Joueurs disponibles pour le meilleur buteur (triés alphabétiquement)
const TOP_SCORER_PLAYERS = [
  "Aaron Wan-Bissaka (RD)",
  "Abde Ezzalzouli (Maroc)",
  "Abdoulaye Seck (Sénégal)",
  "Abdul Fatawu Issahaku (Ghana)",
  "Abdul Mumin (Ghana)",
  "Achraf Hakimi (Maroc)",
  "Achref Abada (Algérie)",
  "Adil Boulbina (Algérie)",
  "Adrien Rabiot (France)",
  "Ahmed Fatouh (Égypte)",
  "Ahmed Sayed Zizo (Égypte)",
  "Aiden O'Neill (Australie)",
  "Ajdin Hrustic (Australie)",
  "Alan Franco (Équateur)",
  "Alan Minda (Équateur)",
  "Alejandro Grimaldo (Espagne)",
  "Alejandro Romero (Paraguay)",
  "Alejandro Zendejas (États-Unis)",
  "Aleksandar Pavlovic (Allemagne)",
  "Alessandro Circati (Australie)",
  "Alessandro Maidana (Paraguay)",
  "Alessandro Schöpf (Autriche)",
  "Alex Arce (Paraguay)",
  "Alex Baena (Espagne)",
  "Alex Freeman (États-Unis)",
  "Alex Sandro (Brésil)",
  "Alexander Bernhardsson (Suède)",
  "Alexander Isak (Suède)",
  "Alexander Prass (Autriche)",
  "Alexander Sörloth (Norvège)",
  "Alexis Mac Allister (Argentine)",
  "Alexis Saelemaekers (Belgique)",
  "Alexis Vega (Mexique)",
  "Alfie Jones (Canada)",
  "Ali Ahmed (Canada)",
  "Alidu Seidu (Ghana)",
  "Alistair Johnston (Canada)",
  "Alphonso Davies (Canada)",
  "Alvaro Fidalgo (Mexique)",
  "Amad Diallo (Côte)",
  "Amadou Onana (Belgique)",
  "Amar Dedic (Bosnie-Herzégovine)",
  "Amar Memic (Bosnie-Herzégovine)",
  "Amine Gouiri (Algérie)",
  "Amir Hadziahmetovic (Bosnie-Herzégovine)",
  "Anass Salah Eddine (Maroc)",
  "Andreas Schjelderup (Norvège)",
  "Andrej Kramaric (Croatie)",
  "Andrés Cubas (Paraguay)",
  "Ange-Yoan Bonny (Côte)",
  "Angelo Preciado (Équateur)",
  "Angelo Stiller (Allemagne)",
  "Anis Hadj Moussa (Algérie)",
  "Ante Budimir (Croatie)",
  "Anthony Elanga (Suède)",
  "Anthony Gordon (Angleterre)",
  "Anthony Valencia (Équateur)",
  "Antoine Mendy (Sénégal)",
  "Antoine Semenyo (Ghana)",
  "Antonee Robinson (États-Unis)",
  "Antonio Nusa (Norvège)",
  "Antonio Rüdiger (Allemagne)",
  "Antonio Sanabria (Paraguay)",
  "Ao Tanaka (Japon)",
  "Ardon Jashari (Suisse)",
  "Armando Gonzalez (Mexique)",
  "Armin Gigovic (Bosnie-Herzégovine)",
  "Arthur Masuaku (RD)",
  "Arthur Theate (Belgique)",
  "Assane Diao (Sénégal)",
  "Aubrey Modiba (Afrique)",
  "Augustine Boakye (Ghana)",
  "Aurèle Amenda (Suisse)",
  "Aurélien Tchouaméni (France)",
  "Auston Trusty (États-Unis)",
  "Awer Mabil (Australie)",
  "Axel Tuanzebe (RD)",
  "Axel Witsel (Belgique)",
  "Ayase Ueda (Japon)",
  "Aymeric Laporte (Espagne)",
  "Ayoub El Kaabi (Maroc)",
  "Ayoube Amaimouni (Maroc)",
  "Ayumu Seko (Japon)",
  "Ayyoub Bouaddi (Maroc)",
  "Aziz Behich (Australie)",
  "Azzedine Ounahi (Maroc)",
  "Aïssa Mandi (Algérie)",
  "Baba Abdul Rahman (Ghana)",
  "Bamba Dieng (Sénégal)",
  "Bara Sapoko Ndiaye (Sénégal)",
  "Bazoumana Touré (Côte)",
  "Benjamin Nygren (Suède)",
  "Benjamin Tahirovic (Bosnie-Herzégovine)",
  "Bernardo Silva (Portugal)",
  "Besfort Zeneli (Suède)",
  "Bilal El Khannouss (Maroc)",
  "Borja Iglesias (Espagne)",
  "Bradley Barcola (France)",
  "Bradley Cross (Afrique)",
  "Brahim Diaz (Maroc)",
  "Brandon Mechele (Belgique)",
  "Brandon Thomas-Asante (Ghana)",
  "Breel Embolo (Suisse)",
  "Bremer (Brésil)",
  "Brenden Aaronson (États-Unis)",
  "Brian Brobbey (Pays-Bas)",
  "Brian Cipenga (RD)",
  "Brian Gutiérrez (Mexique)",
  "Brian Ojeda (Paraguay)",
  "Bruno Fernandes (Portugal)",
  "Bruno Guimaraes (Brésil)",
  "Bukayo Saka (Angleterre)",
  "Caleb Yirenkyi (Ghana)",
  "Cameron Burgess (Australie)",
  "Cameron Devlin (Australie)",
  "Cancelo (Portugal)",
  "Carl Starfelt (Suède)",
  "Carlos Andres Gomez (Colombie)",
  "Carney Chukwuemeka (Autriche)",
  "Casemiro (Brésil)",
  "Chadi Riad (Maroc)",
  "Chancel Mbemba (RD)",
  "Charles De Ketelaere (Belgique)",
  "Charles Pickel (RD)",
  "Chemsdine Talbi (Maroc)",
  "Chris Richards (États-Unis)",
  "Christ Oulai (Côte)",
  "Christian Fassnacht (Suisse)",
  "Christian Pulisic (États-Unis)",
  "Christopher Bonsu Baah (Ghana)",
  "Chérif Ndiaye (Sénégal)",
  "Clément Apka (Côte)",
  "Cody Gakpo (Pays-Bas)",
  "Connor Metcalfe (Australie)",
  "Cristian Roldan (États-Unis)",
  "Cristian Romero (Argentine)",
  "Cristian Volpato (Australie)",
  "Cristiano Ronaldo (Portugal)",
  "Crysencio Summerville (Pays-Bas)",
  "Cyle Larin (Canada)",
  "Cédric Bakambu (RD)",
  "Cédric Itten (Suisse)",
  "César Huerta (Mexique)",
  "César Montes (Mexique)",
  "Daichi Kamada (Japon)",
  "Dailon Livramento (Cap-Vert)",
  "Daizen Maeda (Japon)",
  "Damian Bobadilla (Paraguay)",
  "Dan Burn (Angleterre)",
  "Dan Ndoye (Suisse)",
  "Dani Olmo (Espagne)",
  "Daniel Munoz (Colombie)",
  "Daniel Svensson (Suède)",
  "Danilo (Brésil)",
  "David Affenbruger (Autriche)",
  "David Alaba (Autriche)",
  "David Möller Wolfe (Norvège)",
  "David Raum (Allemagne)",
  "Davinson Sanchez (Colombie)",
  "Dayot Upamecano (France)",
  "Declan Rice (Angleterre)",
  "Deiver Machado (Colombie)",
  "Denil Castillo (Équateur)",
  "Denis Zakaria (Suisse)",
  "Deniz Undav (Allemagne)",
  "Dennis Hadzikadunic (Bosnie-Herzégovine)",
  "Denzel Dumfries (Pays-Bas)",
  "Derek Cornelius (Canada)",
  "Deroy Duarte (Cap-Vert)",
  "Derrick Luckassen (Ghana)",
  "Diego Gomez (Paraguay)",
  "Diego Moreira (Belgique)",
  "Diogo Dalot (Portugal)",
  "Djed Spence (Angleterre)",
  "Djibril Sow (Suisse)",
  "Dodi Lukebakio (Belgique)",
  "Donyell Malen (Pays-Bas)",
  "Douglas Santos (Brésil)",
  "Duje Caleta-Car (Croatie)",
  "Dylan Batubinsika (RD)",
  "Dzenis Burnic (Bosnie-Herzégovine)",
  "Désiré Doué (France)",
  "Eberechi Eze (Angleterre)",
  "Edilson Borges (Cap-Vert)",
  "Edin Dzeko (Bosnie-Herzégovine)",
  "Edo Kayembe (RD)",
  "Edson Alvarez (Mexique)",
  "El Hadji Malick Diouf (Sénégal)",
  "Elisha Owusu (Ghana)",
  "Elliot Anderson (Angleterre)",
  "Elliot Stroud (Suède)",
  "Elye Wahi (Côte)",
  "Emam Ashour (Égypte)",
  "Emil Holm (Suède)",
  "Emmanuel Agbadou (Côte)",
  "Endrick (Brésil)",
  "Enner Valencia (Équateur)",
  "Enzo Fernandez (Argentine)",
  "Eray Cömert (Suisse)",
  "Eric Garcia (Espagne)",
  "Eric Smith (Suède)",
  "Erik Lira (Mexique)",
  "Erling Haaland (Norvège)",
  "Ermedin Demirovic (Bosnie-Herzégovine)",
  "Ermin Mahmic (Bosnie-Herzégovine)",
  "Ernest Nuamah (Ghana)",
  "Esmir Bajraktarevic (Bosnie-Herzégovine)",
  "Evan Ndicka (Côte)",
  "Evann Guessand (Côte)",
  "Evidence Makgopa (Afrique)",
  "Exequiel Palacios (Argentine)",
  "Ezri Konsa (Angleterre)",
  "Fabian Balbuena (Paraguay)",
  "Fabian Rieder (Suisse)",
  "Fabian Ruiz (Espagne)",
  "Fabinho (Brésil)",
  "Facundo Medina (Argentine)",
  "Farès Chaïbi (Algérie)",
  "Farès Ghedjemis (Algérie)",
  "Felix Nmecha (Allemagne)",
  "Ferran Torres (Espagne)",
  "Fiston Mayele (RD)",
  "Florian Grillitsch (Autriche)",
  "Florian Wirtz (Allemagne)",
  "Folarin Balogun (États-Unis)",
  "Francisco Conceiçao (Portugal)",
  "Franck Kessié (Côte)",
  "Fredrik Aursnes (Norvège)",
  "Fredrik Björkan (Norvège)",
  "Frenkie de Jong (Pays-Bas)",
  "Félix Torres (Équateur)",
  "Gabriel (Brésil)",
  "Gabriel Avalos (Paraguay)",
  "Gabriel Gudmundsson (Suède)",
  "Gabriel Martinelli (Brésil)",
  "Garry Rodrigues (Cap-Vert)",
  "Gavi (Espagne)",
  "Gaël Kakuta (RD)",
  "Gessime Yassine (Maroc)",
  "Ghislain Konan (Côte)",
  "Gideon Mensah (Ghana)",
  "Gilberto Mora (Mexique)",
  "Gilson Benchimol (Cap-Vert)",
  "Gio Reyna (États-Unis)",
  "Giovani Lo Celso (Argentine)",
  "Giuliano Simeone (Argentine)",
  "Gonzalo Montiel (Argentine)",
  "Gonzalo Plata (Équateur)",
  "Gonçalo Guedes (Portugal)",
  "Gonçalo Inacio (Portugal)",
  "Gonçalo Ramos (Portugal)",
  "Granit Xhaka (Suisse)",
  "Guillermo Martinez (Mexique)",
  "Gustaf Lagerbielke (Suède)",
  "Gustaf Nilsson (Suède)",
  "Gustavo Caballero (Paraguay)",
  "Gustavo Gomez (Paraguay)",
  "Gustavo Puerta (Colombie)",
  "Gustavo Velazquez (Paraguay)",
  "Guus Til (Pays-Bas)",
  "Guéla Doué (Côte)",
  "Gédéon Kalulu (RD)",
  "Habib Diarra (Sénégal)",
  "Haitham Hassan (Égypte)",
  "Haji Wright (États-Unis)",
  "Hamdi Fathi (Égypte)",
  "Hamza Abdelkarim (Égypte)",
  "Hans Vanaken (Belgique)",
  "Haris Tabakovic (Bosnie-Herzégovine)",
  "Harry Kane (Angleterre)",
  "Harry Souttar (Australie)",
  "Henrik Falchener (Norvège)",
  "Hicham Boudaoui (Algérie)",
  "Hiroki Ito (Japon)",
  "Hjalmar Ekdal (Suède)",
  "Hossam Abdelmaguid (Égypte)",
  "Houssem Aouar (Algérie)",
  "Hélio Varela (Cap-Vert)",
  "Ibanez (Brésil)",
  "Ibarhaim Maza (Algérie)",
  "Ibrahim Adel (Égypte)",
  "Ibrahim Mbaye (Sénégal)",
  "Ibrahim Sangaré (Côte)",
  "Ibrahima Konaté (France)",
  "Idrissa Gana Gueye (Sénégal)",
  "Igor Matanovic (Croatie)",
  "Igor Thiago (Brésil)",
  "Iliman Ndiaye (Sénégal)",
  "Ime Okon (Afrique)",
  "Iqraam Rayners (Afrique)",
  "Isak Hien (Suède)",
  "Isidoro Pitta (Paraguay)",
  "Ismael Saibari (Maroc)",
  "Ismail Jakobs (Sénégal)",
  "Ismaël Koné (Canada)",
  "Ismaïla Sarr (Sénégal)",
  "Israel Reyes (Mexique)",
  "Issa Diop (Maroc)",
  "Ivan Basic (Bosnie-Herzégovine)",
  "Ivan Perisic (Croatie)",
  "Ivan Sunjic (Bosnie-Herzégovine)",
  "Ivan Toney (Angleterre)",
  "Iñaki Williams (Ghana)",
  "Jackson Irvine (Australie)",
  "Jackson Porozo (Équateur)",
  "Jacob Italiano (Australie)",
  "Jacob Shaffelburg (Canada)",
  "Jamal Musiala (Allemagne)",
  "James Rodriguez (Colombie)",
  "Jamie Leweling (Allemagne)",
  "Jaminton Campaz (Colombie)",
  "Jamiro Monteiro (Cap-Vert)",
  "Jan Paul van Hecke (Pays-Bas)",
  "Jaouen Hadjam (Algérie)",
  "Jarell Quansah (Angleterre)",
  "Jason Geria (Australie)",
  "Jayden Adams (Afrique)",
  "Jean-Michaël Séri (Côte)",
  "Jean-Philippe Mateta (France)",
  "Jefferson Lerma (Colombie)",
  "Jens Petter Hauge (Norvège)",
  "Jeremy Arévalo (Équateur)",
  "Jeremy Doku (Belgique)",
  "Jerome Opoku (Ghana)",
  "Jesper Karlström (Suède)",
  "Jesus Gallardo (Mexique)",
  "Jhon Arias (Colombie)",
  "Jhon Cordoba (Colombie)",
  "Jhon Lucumi (Colombie)",
  "Joao Felix (Portugal)",
  "Joao Neves (Portugal)",
  "Joaquin Seys (Belgique)",
  "Joe Scally (États-Unis)",
  "Joel Ordonez (Équateur)",
  "Joel Waterman (Canada)",
  "Johan Manzambi (Suisse)",
  "Johan Mojica (Colombie)",
  "Johan Vasquez (Mexique)",
  "John Stones (Angleterre)",
  "John Yeboah (Équateur)",
  "Jonas Adjetey (Ghana)",
  "Jonathan David (Canada)",
  "Jonathan Osorio (Canada)",
  "Jonathan Tah (Allemagne)",
  "Jordan Ayew (Ghana)",
  "Jordan Bos (Australie)",
  "Jordan Henderson (Angleterre)",
  "Jordy Alcivar (Équateur)",
  "Jordy Caicedo (Équateur)",
  "Jorge Carrascal (Colombie)",
  "Jorge Sanchez (Mexique)",
  "Joris Kayembe (RD)",
  "Jorrel Hato (Pays-Bas)",
  "Jose Canale (Paraguay)",
  "Joshua Kimmich (Allemagne)",
  "Josip Stanisic (Croatie)",
  "Josip Sutalo (Croatie)",
  "Josko Gvardiol (Croatie)",
  "José Manuel Lopez (Argentine)",
  "Jovane Cabral (Cap-Vert)",
  "Jovo Lukic (Bosnie-Herzégovine)",
  "João Paulo (Cap-Vert)",
  "Juan Caceres (Paraguay)",
  "Juan Camilo Hernandez (Colombie)",
  "Juan Camilo Portilla (Colombie)",
  "Juan Fernando Quintero (Colombie)",
  "Jude Bellingham (Angleterre)",
  "Jules Koundé (France)",
  "Julian Alvarez (Argentine)",
  "Julian Quinones (Mexique)",
  "Julian Ryerson (Norvège)",
  "Julio Enciso (Paraguay)",
  "Junior Alonso (Paraguay)",
  "Junnosuke Suzuki (Japon)",
  "Junya Ito (Japon)",
  "Jurrien Timber (Pays-Bas)",
  "Justin Kluivert (Pays-Bas)",
  "Jörgen Strand Larsen (Norvège)",
  "Kai Havertz (Allemagne)",
  "Kai Trewin (Australie)",
  "Kaishu Sano (Japon)",
  "Kalidou Koulibaly (Sénégal)",
  "Kamaldeen Sulemana (Ghana)",
  "Kamogelo Sebelebele (Afrique)",
  "Karim Hafez (Égypte)",
  "Keisuke Goto (Japon)",
  "Keito Nakamura (Japon)",
  "Kelvin Pires (Cap-Vert)",
  "Ken Sema (Suède)",
  "Kendry Paez (Équateur)",
  "Kento Shiogai (Japon)",
  "Kerim Alajbegovic (Bosnie-Herzégovine)",
  "Kevin Castano (Colombie)",
  "Kevin Danso (Autriche)",
  "Kevin De Bruyne (Belgique)",
  "Kevin Pina (Cap-Vert)",
  "Kevin Rodriguez (Équateur)",
  "Khuliso Mudau (Afrique)",
  "Khulumani Ndamane (Afrique)",
  "Ko Itakura (Japon)",
  "Kobbie Mainoo (Angleterre)",
  "Kojo Peprah Oppong (Ghana)",
  "Koki Ogawa (Japon)",
  "Koni De Winter (Belgique)",
  "Konrad Laimer (Autriche)",
  "Kristian Thorstvedt (Norvège)",
  "Kristijan Jakic (Croatie)",
  "Kristoffer Ajer (Norvège)",
  "Krépin Diatta (Sénégal)",
  "Kwasi Sibo (Ghana)",
  "Kylian Mbappé (France)",
  "Lamine Camara (Sénégal)",
  "Lamine Yamal (Espagne)",
  "Laros Duarte (Cap-Vert)",
  "Lautaro Martinez (Argentine)",
  "Leandro Paredes (Argentine)",
  "Leandro Trossard (Belgique)",
  "Lennart Karl (Allemagne)",
  "Leo Östigard (Norvège)",
  "Leon Goretzka (Allemagne)",
  "Leonardo Balerdi (Argentine)",
  "Leroy Sané (Allemagne)",
  "Liam Millar (Canada)",
  "Lionel Messi (Argentine)",
  "Lisandro Martinez (Argentine)",
  "Logan Costa (Cap-Vert)",
  "Luc de Fougerolles (Canada)",
  "Luca Jaquez (Suisse)",
  "Lucas Bergvall (Suède)",
  "Lucas Digne (France)",
  "Lucas Hernandez (France)",
  "Lucas Herrington (Australie)",
  "Lucas Paqueta (Brésil)",
  "Luis Chavez (Mexique)",
  "Luis Diaz (Colombie)",
  "Luis Romo (Mexique)",
  "Luis Suarez (Colombie)",
  "Luiz Henrique (Brésil)",
  "Luka Modric (Croatie)",
  "Luka Sucic (Croatie)",
  "Luka Vuskovic (Croatie)",
  "Lyle Foster (Afrique)",
  "Léo Pereira (Brésil)",
  "Maghnes Akliouche (France)",
  "Mahmoud Saber (Égypte)",
  "Mahmoud Trezeguet (Égypte)",
  "Malick Thiaw (Allemagne)",
  "Malik Tillman (États-Unis)",
  "Malo Gusto (France)",
  "Mamadou Sarr (Sénégal)",
  "Manu Koné (France)",
  "Manuel Akanji (Suisse)",
  "Marc Cucurella (Espagne)",
  "Marc Guéhi (Angleterre)",
  "Marc Pubill (Espagne)",
  "Marcel Sabitzer (Autriche)",
  "Marco Friedl (Autriche)",
  "Marco Pasalic (Croatie)",
  "Marcos Llorente (Espagne)",
  "Marcus Pedersen (Norvège)",
  "Marcus Rashford (Angleterre)",
  "Marcus Thuram (France)",
  "Marin Pongracic (Croatie)",
  "Mario Pasalic (Croatie)",
  "Mark McKenzie (États-Unis)",
  "Marko Arnautovic (Autriche)",
  "Marquinhos (Brésil)",
  "Marten de Roon (Pays-Bas)",
  "Martin Baturina (Croatie)",
  "Martin Erlic (Croatie)",
  "Martin Zubimendi (Espagne)",
  "Martin Ödegaard (Norvège)",
  "Marvin Senaya (Ghana)",
  "Marwan Attia (Égypte)",
  "Mateo Chavez (Mexique)",
  "Mateo Kovacic (Croatie)",
  "Matheus Cunha (Brésil)",
  "Matheus Nunes (Portugal)",
  "Mathew Leckie (Australie)",
  "Mathieu Choinière (Canada)",
  "Matias Fernandez-Pardo (Belgique)",
  "Matias Galarza (Paraguay)",
  "Mats Wieffer (Pays-Bas)",
  "Mattias Svanberg (Suède)",
  "Mauricio Maghalhaes (Paraguay)",
  "Max Arfsten (États-Unis)",
  "Maxence Lacroix (France)",
  "Maxim De Cuyper (Belgique)",
  "Maximilian Beier (Allemagne)",
  "Mbekezeli Mbokazi (Afrique)",
  "Memphis Depay (Pays-Bas)",
  "Meschack Elia (RD)",
  "Michael Gregoritsch (Autriche)",
  "Michael Olise (France)",
  "Michael Svoboda (Autriche)",
  "Michel Aebischer (Suisse)",
  "Micky van de Ven (Pays-Bas)",
  "Miguel Almiron (Paraguay)",
  "Mikel Merino (Espagne)",
  "Mikel Oyarzabal (Espagne)",
  "Miles Robinson (États-Unis)",
  "Milos Degenek (Australie)",
  "Miro Muheim (Suisse)",
  "Mohamed Abdelmonem (Égypte)",
  "Mohamed Amine Tougai (Algérie)",
  "Mohamed Amoura (Algérie)",
  "Mohamed Hany (Égypte)",
  "Mohamed Salah (Égypte)",
  "Mohamed Touré (Australie)",
  "Mohanad Lasheen (Égypte)",
  "Moises Caicedo (Équateur)",
  "Morgan Rogers (Angleterre)",
  "Morten Thorsby (Norvège)",
  "Mostafa Ziko (Égypte)",
  "Moussa Niakhaté (Sénégal)",
  "Moïse Bombito (Canada)",
  "N'Golo Kanté (France)",
  "Nabil Bentaleb (Algérie)",
  "Nabil Emad Dunga (Égypte)",
  "Nadhir Benbouali (Algérie)",
  "Nadiem Amiri (Allemagne)",
  "Nahuel Molina (Argentine)",
  "Nathan Aké (Pays-Bas)",
  "Nathan Kapuadi (RD)",
  "Nathan Ngoy (Belgique)",
  "Nathan Saliba (Canada)",
  "Nathanaël Mbuku (RD)",
  "Nathaniel Brown (Allemagne)",
  "Nayef Aguerd (Maroc)",
  "Neil El Aynaoui (Maroc)",
  "Nelson Semedo (Portugal)",
  "Nestor Irankunda (Australie)",
  "Neymar (Brésil)",
  "Ngal'ayel Mukau (RD)",
  "Nick Woltemade (Allemagne)",
  "Nico Elvedi (Suisse)",
  "Nico O'Reilly (Angleterre)",
  "Nico Paz (Argentine)",
  "Nico Schlotterbeck (Allemagne)",
  "Nico Williams (Espagne)",
  "Nicolas Gonzalez (Argentine)",
  "Nicolas Jackson (Sénégal)",
  "Nicolas Otamendi (Argentine)",
  "Nicolas Pépé (Côte)",
  "Nicolas Raskin (Belgique)",
  "Nicolas Seiwald (Autriche)",
  "Nicolas Tagliafico (Argentine)",
  "Nidal Celik (Bosnie-Herzégovine)",
  "Nihad Mujakic (Bosnie-Herzégovine)",
  "Niko Sigur (Canada)",
  "Nikola Katic (Bosnie-Herzégovine)",
  "Nikola Moro (Croatie)",
  "Nikola Vlasic (Croatie)",
  "Nilson Angulo (Équateur)",
  "Nishan Velupillay (Australie)",
  "Nkosinathi Sibisi (Afrique)",
  "Noa Lang (Pays-Bas)",
  "Noah Okafor (Suisse)",
  "Noah Sadiki (RD)",
  "Noni Madueke (Angleterre)",
  "Noussair Mazraoui (Maroc)",
  "Nuno Mendes (Portugal)",
  "Nuno da Costa (Cap-Vert)",
  "Obed Vargas (Mexique)",
  "Odilon Kossonou (Côte)",
  "Ollie Watkins (Angleterre)",
  "Olwethu Makhanya (Afrique)",
  "Omar Alderte (Paraguay)",
  "Omar Marmoush (Égypte)",
  "Orbelin Pineda (Mexique)",
  "Oscar Bobb (Norvège)",
  "Oswin Appollis (Afrique)",
  "Oumar Diakité (Côte)",
  "Ousmane Dembélé (France)",
  "Ousmane Diomandé (Côte)",
  "Pape Gueye (Sénégal)",
  "Pape Matar Sarr (Sénégal)",
  "Parfait Guiagon (Côte)",
  "Pascal Gross (Allemagne)",
  "Pathé Ciss (Sénégal)",
  "Patrick Berg (Norvège)",
  "Patrick Wiemmer (Autriche)",
  "Pau Cubarsi (Espagne)",
  "Paul Okon-Engstler (Australie)",
  "Paul Wanner (Autriche)",
  "Pedri (Espagne)",
  "Pedro Neto (Portugal)",
  "Pedro Porro (Espagne)",
  "Pedro Vite (Équateur)",
  "Pervis Estupinan (Équateur)",
  "Petar Musa (Croatie)",
  "Petar Sucic (Croatie)",
  "Philipp Lienhart (Autriche)",
  "Philipp Mwene (Autriche)",
  "Piero Hincapié (Équateur)",
  "Prince Kwabena Adu (Ghana)",
  "Promise David (Canada)",
  "Quinten Timber (Pays-Bas)",
  "Rafael Leao (Portugal)",
  "Rafik Belghali (Algérie)",
  "Ramiz Zerrouki (Algérie)",
  "Ramon Sosa (Paraguay)",
  "Ramy Bensebaini (Algérie)",
  "Ramy Rabia (Égypte)",
  "Raphinha (Brésil)",
  "Raul Jiménez (Mexique)",
  "Rayan (Brésil)",
  "Rayan Aït-Nouri (Algérie)",
  "Rayan Cherki (France)",
  "Redouane Halhal (Maroc)",
  "Reece James (Angleterre)",
  "Relebohile Mofokeng (Afrique)",
  "Remo Freuler (Suisse)",
  "Renato Veiga (Portugal)",
  "Ricardo Pepi (États-Unis)",
  "Ricardo Rodriguez (Suisse)",
  "Richard Rios (Colombie)",
  "Richie Laryea (Canada)",
  "Ristu Doan (Japon)",
  "Riyad Mahrez (Algérie)",
  "Roberto Alvarado (Mexique)",
  "Roberto Lopes (Cap-Vert)",
  "Rocky Bushiri (RD)",
  "Rodri (Espagne)",
  "Rodrigo De Paul (Argentine)",
  "Romano Schmid (Autriche)",
  "Romelu Lukaku (Belgique)",
  "Ruben Dias (Portugal)",
  "Ruben Neves (Portugal)",
  "Ruben Vargas (Suisse)",
  "Ryan Gravenberch (Pays-Bas)",
  "Ryan Mendes (Cap-Vert)",
  "Sadio Mané (Sénégal)",
  "Samed Bazdar (Bosnie-Herzégovine)",
  "Samir Chergui (Algérie)",
  "Samir El Mourabet (Maroc)",
  "Samu Costa (Portugal)",
  "Samuel Moutousamy (RD)",
  "Samukele Kabini (Afrique)",
  "Sander Berge (Norvège)",
  "Santiago Arias (Colombie)",
  "Santiago Giménez (Mexique)",
  "Sasa Kalajdzic (Autriche)",
  "Sead Kolasinac (Bosnie-Herzégovine)",
  "Sebastian Berhalter (États-Unis)",
  "Sergino Dest (États-Unis)",
  "Shogo Taniguchi (Japon)",
  "Sidny Cabral (Cap-Vert)",
  "Silvan Widmer (Suisse)",
  "Simon Adingra (Côte)",
  "Simon Banza (RD)",
  "Sofyan Amrabat (Maroc)",
  "Sondre Langas (Norvège)",
  "Soufiane Rahimi (Maroc)",
  "Sphephelo Sithole (Afrique)",
  "Stefan Posch (Autriche)",
  "Stephen Eustaquio (Canada)",
  "Steven Moreira (Cap-Vert)",
  "Stjepan Radeljic (Bosnie-Herzégovine)",
  "Stopira (Cap-Vert)",
  "Séko Fofana (Côte)",
  "Taha Ali (Suède)",
  "Tajon Buchanan (Canada)",
  "Takefusa Kubo (Japon)",
  "Takehiro Tomiyasu (Japon)",
  "Tani Oluwaseyi (Canada)",
  "Tarek Alaa (Égypte)",
  "Tarik Muhamerovic (Bosnie-Herzégovine)",
  "Teboho Mokoena (Afrique)",
  "Telmo Arcanjo (Cap-Vert)",
  "Tete Yengi (Australie)",
  "Teun Koopmeiners (Pays-Bas)",
  "Thabang Matuludi (Afrique)",
  "Thalente Mbatha (Afrique)",
  "Thapelo Maseko (Afrique)",
  "Thelo Aasgaard (Norvège)",
  "Themba Zwane (Afrique)",
  "Theo Hernandez (France)",
  "Thiago Almada (Argentine)",
  "Thomas Araujo (Portugal)",
  "Thomas Meunier (Belgique)",
  "Thomas Partey (Ghana)",
  "Théo Bongonda (RD)",
  "Tijjani Reijnders (Pays-Bas)",
  "Tim Ream (États-Unis)",
  "Timothy Castagne (Belgique)",
  "Timothy Weah (États-Unis)",
  "Tino Livramento (Angleterre)",
  "Toni Fruk (Croatie)",
  "Torbjörn Heggem (Norvège)",
  "Trincao (Portugal)",
  "Tshepang Moremi (Afrique)",
  "Tsuyoshi Watanabe (Japon)",
  "Tyler Adams (États-Unis)",
  "Valentin Barco (Argentine)",
  "Victor Lindelöf (Suède)",
  "Victor Munoz (Espagne)",
  "Viktor Gyökeres (Suède)",
  "Vinicius Junior (Brésil)",
  "Virgil van Dijk (Pays-Bas)",
  "Vitinha (Portugal)",
  "Wagner Pina (Cap-Vert)",
  "Waldemar Anton (Allemagne)",
  "Warren Zaïre-Emery (France)",
  "Wataru Endo (Japon)",
  "Wesley França (Brésil)",
  "Weston McKennie (États-Unis)",
  "Wilfried Singo (Côte)",
  "Willer Ditta (Colombie)",
  "William Saliba (France)",
  "Willian Pacho (Équateur)",
  "Willy Semedo (Cap-Vert)",
  "Wout Weghorst (Pays-Bas)",
  "Xaver Schlager (Autriche)",
  "Yacine Titraoui (Algérie)",
  "Yaimar Medina (Équateur)",
  "Yan Diomandé (Côte)",
  "Yannick Semedo (Cap-Vert)",
  "Yasin Ayari (Suède)",
  "Yasser Ibrahim (Égypte)",
  "Yeremy Pino (Espagne)",
  "Yerry Mina (Colombie)",
  "Yoane Wissa (RD)",
  "Youri Tielemans (Belgique)",
  "Youssef Belammari (Maroc)",
  "Yuito Suzuki (Japon)",
  "Yukinari Sugawara (Japon)",
  "Yuto Nagatomo (Japon)",
  "Zakaria El Ouahdi (Maroc)",
  "Zeki Amdouni (Suisse)",
  "Zeno Debast (Belgique)",
  "Zinedine Belaïd (Algérie)",
];

// Points par phase éliminatoire
const ELIM_POINTS = {
  "R16": 2, "R8": 3, "QF": 4, "SF": 5, "F": 6
};

const PLAYED = {
  "A1": { home: 2, away: 0 },
  "A2": { home: 2, away: 1 },
  "B1": { home: 1, away: 1 },
  "D1": { home: 4, away: 1 },
};

const GROUPS = [
  { id:"A", name:"Groupe A", teams:["Mexique 🇲🇽","Afrique du Sud 🇿🇦","Corée du Sud 🇰🇷","Tchéquie 🇨🇿"], matches:[
    {id:"A1",home:"Mexique 🇲🇽",away:"Afrique du Sud 🇿🇦",date:"11 juin"},
    {id:"A2",home:"Corée du Sud 🇰🇷",away:"Tchéquie 🇨🇿",date:"12 juin"},
    {id:"A3",home:"Tchéquie 🇨🇿",away:"Afrique du Sud 🇿🇦",date:"18 juin"},
    {id:"A4",home:"Mexique 🇲🇽",away:"Corée du Sud 🇰🇷",date:"19 juin"},
    {id:"A5",home:"Tchéquie 🇨🇿",away:"Mexique 🇲🇽",date:"25 juin"},
    {id:"A6",home:"Afrique du Sud 🇿🇦",away:"Corée du Sud 🇰🇷",date:"25 juin"},
  ]},
  { id:"B", name:"Groupe B", teams:["Canada 🇨🇦","Bosnie-Herzégovine 🇧🇦","Qatar 🇶🇦","Suisse 🇨🇭"], matches:[
    {id:"B1",home:"Canada 🇨🇦",away:"Bosnie-Herzégovine 🇧🇦",date:"12 juin"},
    {id:"B2",home:"Qatar 🇶🇦",away:"Suisse 🇨🇭",date:"13 juin"},
    {id:"B3",home:"Suisse 🇨🇭",away:"Bosnie-Herzégovine 🇧🇦",date:"18 juin"},
    {id:"B4",home:"Canada 🇨🇦",away:"Qatar 🇶🇦",date:"19 juin"},
    {id:"B5",home:"Bosnie-Herzégovine 🇧🇦",away:"Qatar 🇶🇦",date:"24 juin"},
    {id:"B6",home:"Suisse 🇨🇭",away:"Canada 🇨🇦",date:"24 juin"},
  ]},
  { id:"C", name:"Groupe C", teams:["Brésil 🇧🇷","Maroc 🇲🇦","Haïti 🇭🇹","Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿"], matches:[
    {id:"C1",home:"Brésil 🇧🇷",away:"Maroc 🇲🇦",date:"14 juin"},
    {id:"C2",home:"Haïti 🇭🇹",away:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",date:"14 juin"},
    {id:"C3",home:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",away:"Maroc 🇲🇦",date:"20 juin"},
    {id:"C4",home:"Brésil 🇧🇷",away:"Haïti 🇭🇹",date:"20 juin"},
    {id:"C5",home:"Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿",away:"Brésil 🇧🇷",date:"25 juin"},
    {id:"C6",home:"Maroc 🇲🇦",away:"Haïti 🇭🇹",date:"25 juin"},
  ]},
  { id:"D", name:"Groupe D", teams:["États-Unis 🇺🇸","Paraguay 🇵🇾","Australie 🇦🇺","Türkiye 🇹🇷"], matches:[
    {id:"D1",home:"États-Unis 🇺🇸",away:"Paraguay 🇵🇾",date:"13 juin"},
    {id:"D2",home:"Australie 🇦🇺",away:"Türkiye 🇹🇷",date:"13 juin"},
    {id:"D3",home:"États-Unis 🇺🇸",away:"Australie 🇦🇺",date:"19 juin"},
    {id:"D4",home:"Türkiye 🇹🇷",away:"Paraguay 🇵🇾",date:"20 juin"},
    {id:"D5",home:"Türkiye 🇹🇷",away:"États-Unis 🇺🇸",date:"26 juin"},
    {id:"D6",home:"Paraguay 🇵🇾",away:"Australie 🇦🇺",date:"26 juin"},
  ]},
  { id:"E", name:"Groupe E", teams:["Allemagne 🇩🇪","Curaçao 🇨🇼","Côte d\'Ivoire 🇨🇮","Équateur 🇪🇨"], matches:[
    {id:"E1",home:"Allemagne 🇩🇪",away:"Curaçao 🇨🇼",date:"14 juin"},
    {id:"E2",home:"Côte d\'Ivoire 🇨🇮",away:"Équateur 🇪🇨",date:"14 juin"},
    {id:"E3",home:"Allemagne 🇩🇪",away:"Côte d\'Ivoire 🇨🇮",date:"20 juin"},
    {id:"E4",home:"Équateur 🇪🇨",away:"Curaçao 🇨🇼",date:"21 juin"},
    {id:"E5",home:"Équateur 🇪🇨",away:"Allemagne 🇩🇪",date:"25 juin"},
    {id:"E6",home:"Curaçao 🇨🇼",away:"Côte d\'Ivoire 🇨🇮",date:"25 juin"},
  ]},
  { id:"F", name:"Groupe F", teams:["Pays-Bas 🇳🇱","Japon 🇯🇵","Suède 🇸🇪","Tunisie 🇹🇳"], matches:[
    {id:"F1",home:"Pays-Bas 🇳🇱",away:"Japon 🇯🇵",date:"14 juin"},
    {id:"F2",home:"Suède 🇸🇪",away:"Tunisie 🇹🇳",date:"14 juin"},
    {id:"F3",home:"Pays-Bas 🇳🇱",away:"Suède 🇸🇪",date:"20 juin"},
    {id:"F4",home:"Tunisie 🇹🇳",away:"Japon 🇯🇵",date:"21 juin"},
    {id:"F5",home:"Japon 🇯🇵",away:"Suède 🇸🇪",date:"26 juin"},
    {id:"F6",home:"Tunisie 🇹🇳",away:"Pays-Bas 🇳🇱",date:"26 juin"},
  ]},
  { id:"G", name:"Groupe G", teams:["Belgique 🇧🇪","Égypte 🇪🇬","Iran 🇮🇷","Nouvelle-Zélande 🇳🇿"], matches:[
    {id:"G1",home:"Belgique 🇧🇪",away:"Égypte 🇪🇬",date:"15 juin"},
    {id:"G2",home:"Iran 🇮🇷",away:"Nouvelle-Zélande 🇳🇿",date:"15 juin"},
    {id:"G3",home:"Belgique 🇧🇪",away:"Iran 🇮🇷",date:"21 juin"},
    {id:"G4",home:"Nouvelle-Zélande 🇳🇿",away:"Égypte 🇪🇬",date:"22 juin"},
    {id:"G5",home:"Nouvelle-Zélande 🇳🇿",away:"Belgique 🇧🇪",date:"27 juin"},
    {id:"G6",home:"Égypte 🇪🇬",away:"Iran 🇮🇷",date:"27 juin"},
  ]},
  { id:"H", name:"Groupe H", teams:["Espagne 🇪🇸","Cap-Vert 🇨🇻","Arabie saoudite 🇸🇦","Uruguay 🇺🇾"], matches:[
    {id:"H1",home:"Espagne 🇪🇸",away:"Cap-Vert 🇨🇻",date:"15 juin"},
    {id:"H2",home:"Arabie saoudite 🇸🇦",away:"Uruguay 🇺🇾",date:"15 juin"},
    {id:"H3",home:"Espagne 🇪🇸",away:"Arabie saoudite 🇸🇦",date:"21 juin"},
    {id:"H4",home:"Uruguay 🇺🇾",away:"Cap-Vert 🇨🇻",date:"22 juin"},
    {id:"H5",home:"Cap-Vert 🇨🇻",away:"Arabie saoudite 🇸🇦",date:"26 juin"},
    {id:"H6",home:"Uruguay 🇺🇾",away:"Espagne 🇪🇸",date:"26 juin"},
  ]},
  { id:"I", name:"Groupe I", teams:["France 🇫🇷","Sénégal 🇸🇳","Irak 🇮🇶","Norvège 🇳🇴"], matches:[
    {id:"I1",home:"France 🇫🇷",away:"Sénégal 🇸🇳",date:"16 juin"},
    {id:"I2",home:"Irak 🇮🇶",away:"Norvège 🇳🇴",date:"16 juin"},
    {id:"I3",home:"France 🇫🇷",away:"Irak 🇮🇶",date:"22 juin"},
    {id:"I4",home:"Norvège 🇳🇴",away:"Sénégal 🇸🇳",date:"23 juin"},
    {id:"I5",home:"Sénégal 🇸🇳",away:"Irak 🇮🇶",date:"26 juin"},
    {id:"I6",home:"Norvège 🇳🇴",away:"France 🇫🇷",date:"26 juin"},
  ]},
  { id:"J", name:"Groupe J", teams:["Argentine 🇦🇷","Algérie 🇩🇿","Autriche 🇦🇹","Jordanie 🇯🇴"], matches:[
    {id:"J1",home:"Argentine 🇦🇷",away:"Algérie 🇩🇿",date:"16 juin"},
    {id:"J2",home:"Autriche 🇦🇹",away:"Jordanie 🇯🇴",date:"16 juin"},
    {id:"J3",home:"Argentine 🇦🇷",away:"Autriche 🇦🇹",date:"22 juin"},
    {id:"J4",home:"Jordanie 🇯🇴",away:"Algérie 🇩🇿",date:"23 juin"},
    {id:"J5",home:"Argentine 🇦🇷",away:"Jordanie 🇯🇴",date:"28 juin"},
    {id:"J6",home:"Autriche 🇦🇹",away:"Algérie 🇩🇿",date:"28 juin"},
  ]},
  { id:"K", name:"Groupe K", teams:["Portugal 🇵🇹","RD Congo 🇨🇩","Ouzbékistan 🇺🇿","Colombie 🇨🇴"], matches:[
    {id:"K1",home:"Portugal 🇵🇹",away:"RD Congo 🇨🇩",date:"17 juin"},
    {id:"K2",home:"Ouzbékistan 🇺🇿",away:"Colombie 🇨🇴",date:"17 juin"},
    {id:"K3",home:"Portugal 🇵🇹",away:"Ouzbékistan 🇺🇿",date:"23 juin"},
    {id:"K4",home:"Colombie 🇨🇴",away:"RD Congo 🇨🇩",date:"24 juin"},
    {id:"K5",home:"Portugal 🇵🇹",away:"Colombie 🇨🇴",date:"28 juin"},
    {id:"K6",home:"RD Congo 🇨🇩",away:"Ouzbékistan 🇺🇿",date:"28 juin"},
  ]},
  { id:"L", name:"Groupe L", teams:["Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿","Ghana 🇬🇭","Croatie 🇭🇷","Panama 🇵🇦"], matches:[
    {id:"L1",home:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",away:"Croatie 🇭🇷",date:"17 juin"},
    {id:"L2",home:"Ghana 🇬🇭",away:"Panama 🇵🇦",date:"18 juin"},
    {id:"L3",home:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",away:"Ghana 🇬🇭",date:"23 juin"},
    {id:"L4",home:"Panama 🇵🇦",away:"Croatie 🇭🇷",date:"24 juin"},
    {id:"L5",home:"Panama 🇵🇦",away:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",date:"27 juin"},
    {id:"L6",home:"Croatie 🇭🇷",away:"Ghana 🇬🇭",date:"27 juin"},
  ]},
];

// Phase éliminatoire — tableau complet dès les 16es
// Chaque match : id, home, away, date, phase, matchNum
// Pour 8es/QF/SF/F : home/away = "Vainqueur MXX"
const ELIM_ROUNDS = [
  {
    id:"R16", name:"16es de finale",
    matches:[
      {id:"M01",home:"Afrique du Sud 🇿🇦",away:"Canada 🇨🇦",date:"28 juin"},
      {id:"M02",home:"Brésil 🇧🇷",away:"Japon 🇯🇵",date:"29 juin"},
      {id:"M03",home:"Allemagne 🇩🇪",away:"Paraguay 🇵🇾",date:"29 juin"},
      {id:"M04",home:"Pays-Bas 🇳🇱",away:"Maroc 🇲🇦",date:"30 juin"},
      {id:"M05",home:"Côte d\'Ivoire 🇨🇮",away:"Norvège 🇳🇴",date:"30 juin"},
      {id:"M06",home:"France 🇫🇷",away:"Suède 🇸🇪",date:"30 juin"},
      {id:"M07",home:"Mexique 🇲🇽",away:"Équateur 🇪🇨",date:"1 juil."},
      {id:"M08",home:"Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿",away:"RD Congo 🇨🇩",date:"1 juil."},
      {id:"M09",home:"Belgique 🇧🇪",away:"Sénégal 🇸🇳",date:"1 juil."},
      {id:"M10",home:"États-Unis 🇺🇸",away:"Bosnie-Herzégovine 🇧🇦",date:"2 juil."},
      {id:"M11",home:"Espagne 🇪🇸",away:"Autriche 🇦🇹",date:"2 juil."},
      {id:"M12",home:"Portugal 🇵🇹",away:"Croatie 🇭🇷",date:"3 juil."},
      {id:"M13",home:"Suisse 🇨🇭",away:"Algérie 🇩🇿",date:"3 juil."},
      {id:"M14",home:"Australie 🇦🇺",away:"Égypte 🇪🇬",date:"3 juil."},
      {id:"M15",home:"Argentine 🇦🇷",away:"Cap-Vert 🇨🇻",date:"4 juil."},
      {id:"M16",home:"Colombie 🇨🇴",away:"Ghana 🇬🇭",date:"4 juil."},
    ]
  },
  {
    id:"R8", name:"8es de finale",
    matches:[
      {id:"M17",home:"Vainqueur M01",away:"Vainqueur M02",date:"à venir"},
      {id:"M18",home:"Vainqueur M03",away:"Vainqueur M04",date:"à venir"},
      {id:"M19",home:"Vainqueur M05",away:"Vainqueur M06",date:"à venir"},
      {id:"M20",home:"Vainqueur M07",away:"Vainqueur M08",date:"à venir"},
      {id:"M21",home:"Vainqueur M09",away:"Vainqueur M10",date:"à venir"},
      {id:"M22",home:"Vainqueur M11",away:"Vainqueur M12",date:"à venir"},
      {id:"M23",home:"Vainqueur M13",away:"Vainqueur M14",date:"à venir"},
      {id:"M24",home:"Vainqueur M15",away:"Vainqueur M16",date:"à venir"},
    ]
  },
  {
    id:"QF", name:"Quarts de finale",
    matches:[
      {id:"M25",home:"Vainqueur M17",away:"Vainqueur M18",date:"à venir"},
      {id:"M26",home:"Vainqueur M19",away:"Vainqueur M20",date:"à venir"},
      {id:"M27",home:"Vainqueur M21",away:"Vainqueur M22",date:"à venir"},
      {id:"M28",home:"Vainqueur M23",away:"Vainqueur M24",date:"à venir"},
    ]
  },
  {
    id:"SF", name:"Demi-finales",
    matches:[
      {id:"M29",home:"Vainqueur M25",away:"Vainqueur M26",date:"à venir"},
      {id:"M30",home:"Vainqueur M27",away:"Vainqueur M28",date:"à venir"},
    ]
  },
  {
    id:"F", name:"Finale",
    matches:[
      {id:"M31",home:"Vainqueur M29",away:"Vainqueur M30",date:"19 juil."},
    ]
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getResult = (home, away) => {
  if (home===""||home===undefined||away===""||away===undefined) return null;
  const h=parseInt(home),a=parseInt(away);
  if (isNaN(h)||isNaN(a)) return null;
  return h>a?"H":a>h?"A":"D";
};

// Phase de groupes : bon résultat = 1pt, score exact = 2pts
const computeGroupPoints = (prediction, actual) => {
  if (!actual||prediction.home===""||prediction.home===undefined||prediction.away===""||prediction.away===undefined) return 0;
  const pr=getResult(prediction.home,prediction.away),ar=getResult(actual.home,actual.away);
  if (!pr||!ar||pr!==ar) return 0;
  return parseInt(prediction.home)===actual.home&&parseInt(prediction.away)===actual.away?2:1;
};

// Phase éliminatoire : vainqueur = N pts selon phase, score exact = +1 bonus
const computeElimPoints = (prediction, actual, phase) => {
  if (!actual||!prediction||prediction.winner===undefined||prediction.winner==="") return 0;
  if (actual.winner===undefined||actual.winner==="") return 0;
  const basePts = ELIM_POINTS[phase]||2;
  if (prediction.winner !== actual.winner) return 0;
  // Bonus score exact au temps réglementaire
  if (prediction.homeScore!==""&&prediction.homeScore!==undefined&&
      prediction.awayScore!==""&&prediction.awayScore!==undefined&&
      actual.homeScore!==undefined&&actual.awayScore!==undefined&&
      parseInt(prediction.homeScore)===actual.homeScore&&
      parseInt(prediction.awayScore)===actual.awayScore) {
    return basePts + 1;
  }
  return basePts;
};

const computeQualPointsDetailed = (playerQuals, officialQuals) => {
  if (!officialQuals||officialQuals.length<2||!playerQuals) return {pts:0,breakdown:{team1:0,team2:0,bonus:0}};
  const [o1,o2]=officialQuals,[p1,p2]=playerQuals;
  const t1=p1&&[o1,o2].includes(p1)?1:0;
  const t2=p2&&[o1,o2].includes(p2)?1:0;
  const bonus=p1===o1&&p2===o2?2:0;
  return {pts:t1+t2+bonus,breakdown:{team1:t1,team2:t2,bonus}};
};

// ─── ÉTAT INITIAL ─────────────────────────────────────────────────────────────

const buildFreshState = () => {
  const predictions={},quals={},elimPredictions={},topScorer={};
  PLAYERS.forEach(p=>{
    predictions[p]={};
    quals[p]={};
    elimPredictions[p]={};
    topScorer[p]="";
    GROUPS.forEach(g=>{quals[p][g.id]=[];});
  });
  return {
    predictions, quals, elimPredictions, topScorer,
    actual:{...PLAYED}, officialQuals:{}, elimActual:{}, officialTopScorer:"",
    tab:"prono", activePlayer:PLAYERS[0], activeGroup:"A", activeRound:"R16"
  };
};

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function reducer(state,action){
  switch(action.type){
    case "FIREBASE_LOAD": return {...state,...action.data};
    case "SET_PREDICTION":{const{player,matchId,side,value}=action;return{...state,predictions:{...state.predictions,[player]:{...state.predictions[player],[matchId]:{...state.predictions[player][matchId],[side]:value}}}};}
    case "SET_ACTUAL":{const{matchId,side,value}=action;return{...state,actual:{...state.actual,[matchId]:{...state.actual[matchId],[side]:value}}};}
    case "SET_ELIM_PRED":{
      const{player,matchId,field,value}=action;
      return{...state,elimPredictions:{...state.elimPredictions,[player]:{...state.elimPredictions[player],[matchId]:{...state.elimPredictions[player][matchId],[field]:value}}}};
    }
    case "SET_ELIM_ACTUAL":{
      const{matchId,field,value}=action;
      return{...state,elimActual:{...state.elimActual,[matchId]:{...state.elimActual[matchId],[field]:value}}};
    }
    case "SET_TOP_SCORER":{
      return{...state,topScorer:{...state.topScorer,[action.player]:action.value}};
    }
    case "SET_OFFICIAL_TOP_SCORER":{
      return{...state,officialTopScorer:action.value};
    }
    case "TOGGLE_QUAL":{
      const{player,groupId,team}=action;
      const raw=state.quals[player]?.[groupId]||[];
      const cur=(Array.isArray(raw)?raw:Object.values(raw)).filter(t=>t!=null&&t!==undefined&&t!=="");
      const idx=cur.indexOf(team);
      let next;
      if(idx!==-1){next=cur.filter(t=>t!==team);}
      else if(cur.length===0){next=[team];}
      else if(cur.length===1){next=[cur[0],team];}
      else{next=[team,cur[1]];}
      return{...state,quals:{...state.quals,[player]:{...state.quals[player],[groupId]:next}}};
    }
    case "TOGGLE_OFFICIAL_QUAL":{
      const{groupId,team}=action;
      const cur=state.officialQuals[groupId]||[];
      const idx=cur.indexOf(team);
      const next=idx!==-1?cur.filter(t=>t!==team):cur.length<2?[...cur,team]:cur;
      return{...state,officialQuals:{...state.officialQuals,[groupId]:next}};
    }
    case "SET_TAB":return{...state,tab:action.tab};
    case "SET_PLAYER":return{...state,activePlayer:action.player};
    case "SET_GROUP":return{...state,activeGroup:action.group};
    case "SET_ROUND":return{...state,activeRound:action.round};
    case "RESET":return{...buildFreshState(),tab:state.tab};
    default:return state;
  }
}

// ─── COULEURS ────────────────────────────────────────────────────────────────

const C={bg:"#080f1e",card:"#132038",border:"#1e3a5f",accent:"#22d3ee",gold:"#fbbf24",text:"#e2e8f0",muted:"#64748b",green:"#10b981",red:"#ef4444",purple:"#a78bfa"};

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────

const ScoreInput=({value,onChange,disabled,small})=>(
  <input type="number" min="0" max="20" value={value??""} onChange={e=>onChange(e.target.value)} disabled={disabled} inputMode="numeric"
    style={{width:small?40:52,height:small?40:52,textAlign:"center",fontSize:small?18:22,fontWeight:700,
      border:disabled?"2px solid #334155":"2px solid #22d3ee",borderRadius:10,
      background:disabled?"#1e293b":"#0f172a",color:disabled?"#64748b":"#e2e8f0",
      outline:"none",cursor:disabled?"not-allowed":"text",fontFamily:"monospace",
      WebkitAppearance:"none",MozAppearance:"textfield"}}
  />
);

const Badge=({pts})=>{
  if(pts===null||pts===undefined) return null;
  const col=pts>=5?C.purple:pts>=3?C.green:pts>=2?C.gold:pts===1?C.gold:C.red;
  return <span style={{background:col+"22",color:col,border:`1px solid ${col}`,borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
    {pts>0?`+${pts} pts`:"0"}
  </span>;
};

const QualBtn=({team,rank,isOfficial,playerColor,onClick})=>{
  const label=rank===1?"1er":rank===2?"2e":null;
  const ok=rank&&isOfficial;
  const bc=ok?"#10b981":rank?(playerColor||C.accent):"#1e3a5f";
  const bg=ok?"#10b98122":rank?(playerColor||C.accent)+"22":"transparent";
  const tc=ok?"#10b981":rank?(playerColor||C.accent):C.muted;
  return(
    <button onClick={onClick} style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${bc}`,background:bg,color:tc,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,minHeight:44}}>
      {label&&<span style={{background:ok?"#10b981":(playerColor||C.accent),color:"#000",borderRadius:4,padding:"2px 6px",fontSize:11,fontWeight:900,minWidth:28,textAlign:"center"}}>{label}</span>}
      {team}{ok&&" ✓"}
    </button>
  );
};

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────

export default function App(){
  const fresh=buildFreshState();
  const [state,dispatch]=useReducer(reducer,fresh);
  const [syncStatus,setSyncStatus]=useState("connecting");
  const [resetConfirm,setResetConfirm]=useState(false);
  const isMounted=useRef(true);
  const skipNextSave=useRef(false);

  // ── Firebase load ─────────────────────────────────────────────────────────
  useEffect(()=>{
    isMounted.current=true;
    const dbRef=ref(db,"mondial2026");
    const unsub=onValue(dbRef,snapshot=>{
      if(!isMounted.current) return;
      const data=snapshot.val();
      if(data){
        skipNextSave.current=true;
        const toArray=(val)=>{
          if(!val) return [];
          if(Array.isArray(val)) return val.filter(Boolean);
          return Object.keys(val).sort((a,b)=>Number(a)-Number(b)).map(k=>val[k]).filter(Boolean);
        };
        // Reconstituer quals (nouveau format : quals[player][groupId])
        const rawQuals=data.quals||{};
        const fixedQuals={};
        PLAYERS.forEach(p=>{
          fixedQuals[p]={};
          GROUPS.forEach(g=>{
            const raw=rawQuals[p]?.[g.id]||rawQuals[`${p}-${g.id}`]||[];
            fixedQuals[p][g.id]=toArray(raw);
          });
        });
        const rawOQ=data.officialQuals||{};
        const fixedOQ={};
        Object.keys(rawOQ).forEach(gId=>{fixedOQ[gId]=toArray(rawOQ[gId]);});

        dispatch({type:"FIREBASE_LOAD",data:{
          predictions:{...fresh.predictions,...(data.predictions||{})},
          quals:fixedQuals,
          elimPredictions:{...fresh.elimPredictions,...(data.elimPredictions||{})},
          topScorer:{...fresh.topScorer,...(data.topScorer||{})},
          actual:{...fresh.actual,...(data.actual||{})},
          officialQuals:fixedOQ,
          elimActual:data.elimActual||{},
          officialTopScorer:data.officialTopScorer||"",
        }});
      }
      setSyncStatus("synced");
    },()=>setSyncStatus("error"));
    return()=>{isMounted.current=false;unsub();};
  },[]);

  // ── Firebase save ─────────────────────────────────────────────────────────
  useEffect(()=>{
    if(skipNextSave.current){skipNextSave.current=false;return;}
    if(syncStatus==="connecting") return;
    setSyncStatus("saving");
    const timer=setTimeout(()=>{
      set(ref(db,"mondial2026"),{
        predictions:state.predictions,
        quals:state.quals,
        elimPredictions:state.elimPredictions,
        topScorer:state.topScorer,
        actual:state.actual,
        officialQuals:state.officialQuals,
        elimActual:state.elimActual,
        officialTopScorer:state.officialTopScorer,
      }).then(()=>setSyncStatus("synced")).catch(()=>setSyncStatus("error"));
    },600);
    return()=>clearTimeout(timer);
  },[state.predictions,state.quals,state.elimPredictions,state.topScorer,state.actual,state.officialQuals,state.elimActual,state.officialTopScorer]);

  const{predictions,quals,elimPredictions,topScorer,actual,officialQuals,elimActual,officialTopScorer,tab,activePlayer,activeGroup,activeRound}=state;
  const pc=getPlayerColor(activePlayer);
  const locked=isTopScorerLocked();

  const shortName=n=>n.replace(/ 🇲🇽|🇿🇦|🇰🇷|🇨🇿|🇨🇦|🇧🇦|🇶🇦|🇨🇭|🇧🇷|🇲🇦|🇭🇹|🏴󠁧󠁢󠁳󠁣󠁴󠁿|🇺🇸|🇵🇾|🇦🇺|🇹🇷|🇩🇪|🇨🇼|🇨🇮|🇪🇨|🇳🇱|🇯🇵|🇸🇪|🇹🇳|🇧🇪|🇪🇬|🇮🇷|🇳🇿|🇪🇸|🇨🇻|🇸🇦|🇺🇾|🇫🇷|🇸🇳|🇮🇶|🇳🇴|🇦🇷|🇩🇿|🇦🇹|🇯🇴|🇵🇹|🇨🇩|🇺🇿|🇨🇴|🏴󠁧󠁢󠁥󠁮󠁧󠁿|🇬🇭|🇭🇷|🇵🇦/g,"").trim();

  // ── Calcul totaux ─────────────────────────────────────────────────────────
  const totals={},bk={};
  PLAYERS.forEach(p=>{
    let gPts=0,qPts=0,bPts=0,ePts=0,tsPts=0;
    // Groupes
    GROUPS.forEach(g=>{
      g.matches.forEach(m=>{gPts+=computeGroupPoints(predictions[p][m.id]||{},actual[m.id]);});
      const pQ=(quals[p]?.[g.id])||[];
      const oQ=officialQuals[g.id]||[];
      const d=computeQualPointsDetailed(pQ,oQ);
      qPts+=d.breakdown.team1+d.breakdown.team2;bPts+=d.breakdown.bonus;
    });
    // Élim
    ELIM_ROUNDS.forEach(round=>{
      round.matches.forEach(m=>{
        const pred=elimPredictions[p]?.[m.id]||{};
        const act=elimActual[m.id]||{};
        ePts+=computeElimPoints(pred,act,round.id);
      });
    });
    // Meilleur buteur
    if(officialTopScorer&&topScorer[p]&&topScorer[p]===officialTopScorer) tsPts=10;
    totals[p]=gPts+qPts+bPts+ePts+tsPts;
    bk[p]={gPts,qPts,bPts,ePts,tsPts};
  });
  const sorted=[...PLAYERS].sort((a,b)=>totals[b]-totals[a]);
  const curGroup=GROUPS.find(g=>g.id===activeGroup);
  const curRound=ELIM_ROUNDS.find(r=>r.id===activeRound);

  const syncIcon=syncStatus==="synced"?"☁️ Sync":syncStatus==="saving"?"⏳...":syncStatus==="connecting"?"🔄":"❌";
  const syncColor=syncStatus==="synced"?C.green:syncStatus==="error"?C.red:C.gold;

  const S={
    header:{background:"linear-gradient(135deg,#0f1f35,#0a2540)",borderBottom:`1px solid ${C.border}`,padding:"16px 16px 0"},
    body:{padding:"12px",maxWidth:640,margin:"0 auto"},
    card:{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:12},
    tab:(a)=>({padding:"10px 12px",fontSize:12,fontWeight:600,border:"none",background:"transparent",color:a?C.accent:C.muted,borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent",cursor:"pointer",marginBottom:-1,whiteSpace:"nowrap"}),
    roundBtn:(a)=>({padding:"7px 12px",borderRadius:8,border:`1px solid ${a?C.accent:C.border}`,background:a?C.accent+"22":"transparent",color:a?C.accent:C.muted,fontWeight:700,fontSize:12,cursor:"pointer",minHeight:38,whiteSpace:"nowrap"}),
    groupBtn:(a)=>({padding:"8px 14px",borderRadius:8,border:`1px solid ${a?C.accent:C.border}`,background:a?C.accent+"22":"transparent",color:a?C.accent:C.muted,fontWeight:700,fontSize:14,cursor:"pointer",minHeight:40}),
    matchRow:{display:"flex",alignItems:"center",gap:6,padding:"10px 0",borderBottom:`1px solid ${C.border}`},
  };

  const PlayerSelect=()=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>👤 Joueur</label>
      <select value={activePlayer} onChange={e=>dispatch({type:"SET_PLAYER",player:e.target.value})}
        style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${pc}`,background:"#0f172a",color:pc,fontSize:16,fontWeight:700,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none"}}>
        {PLAYERS.map(p=><option key={p} value={p} style={{color:"#e2e8f0",background:"#132038"}}>{p} — {totals[p]} pts</option>)}
      </select>
    </div>
  );

  // ── PRONOSTICS GROUPES ────────────────────────────────────────────────────
  const PronosGroupes=()=>{
    const pQuals=(quals[activePlayer]?.[curGroup?.id])||[];
    const oQuals=officialQuals[curGroup?.id]||[];
    const detail=curGroup?computeQualPointsDetailed(pQuals,oQuals):null;
    return(
      <div>
        <PlayerSelect/>
        {/* Tabs groupes / élim */}
        <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
          {GROUPS.map(g=>(
            <button key={g.id} style={S.groupBtn(activeGroup===g.id&&tab==="prono_groupe")} onClick={()=>{dispatch({type:"SET_GROUP",group:g.id});dispatch({type:"SET_TAB",tab:"prono_groupe"});}}>{g.id}</button>
          ))}
        </div>
        {curGroup&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.accent}}>{curGroup.name}</div>
            {curGroup.matches.map(m=>{
              const isPlayed=!!PLAYED[m.id]||(actual[m.id]&&actual[m.id].home!==undefined&&actual[m.id].away!==undefined&&!isNaN(actual[m.id].home)&&!PLAYED[m.id]);
              const isFixed=!!PLAYED[m.id];
              const pred=predictions[activePlayer][m.id]||{};
              const act=actual[m.id];
              const pts=act?computeGroupPoints(pred,act):null;
              return(
                <div key={m.id} style={S.matchRow}>
                  <div style={{fontSize:10,color:C.muted,width:38,textAlign:"center",flexShrink:0}}>{m.date}</div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right",lineHeight:1.3}}>{shortName(m.home)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <ScoreInput value={isFixed?PLAYED[m.id]?.home:pred.home} disabled={isPlayed} onChange={v=>dispatch({type:"SET_PREDICTION",player:activePlayer,matchId:m.id,side:"home",value:v})}/>
                    <span style={{color:C.muted,fontWeight:700,fontSize:14}}>–</span>
                    <ScoreInput value={isFixed?PLAYED[m.id]?.away:pred.away} disabled={isPlayed} onChange={v=>dispatch({type:"SET_PREDICTION",player:activePlayer,matchId:m.id,side:"away",value:v})}/>
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left",lineHeight:1.3}}>{shortName(m.away)}</div>
                  <div style={{width:52,textAlign:"center",flexShrink:0}}>
                    {isPlayed?<span style={{fontSize:10,color:C.muted}}>Joué</span>:<Badge pts={pts}/>}
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.muted,marginBottom:4,fontWeight:600}}>🎯 Qualifiés — <span style={{color:pc}}>1er clic = 1er · 2e clic = 2e</span></div>
              <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Bonus +2 pts si les 2 dans le bon ordre</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {curGroup.teams.map(team=>{
                  const rank=pQuals.indexOf(team)!==-1?pQuals.indexOf(team)+1:null;
                  const isOfficial=rank!==null&&oQuals[rank-1]===team;
                  return <QualBtn key={team} team={team} rank={rank} isOfficial={isOfficial} playerColor={pc} onClick={()=>dispatch({type:"TOGGLE_QUAL",player:activePlayer,groupId:curGroup.id,team})}/>;
                })}
              </div>
              {oQuals.length===2&&detail&&(
                <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.muted}}>Cette poule :</span>
                  <span style={{fontSize:12,color:C.green,fontWeight:700}}>+{detail.breakdown.team1+detail.breakdown.team2} qualifiés</span>
                  {detail.breakdown.bonus>0&&<span style={{fontSize:12,color:C.gold,fontWeight:700}}>⭐ +{detail.breakdown.bonus} bonus ordre</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };


  // ── BRACKET VIEW ──────────────────────────────────────────────────────────
  // Affiche le tableau complet de la phase éliminatoire
  // mode: "prono" (pronostics du joueur actif) ou "admin" (résultats officiels)
  const BracketView=({mode})=>{
    const resolveTeam=(label)=>{
      if(!label||!label.startsWith("Vainqueur")) return label;
      const refId=label.replace("Vainqueur ","");
      return elimActual[refId]?.winner||null;
    };

    const getDisplayName=(label, mode)=>{
      if(!label) return "?";
      if(!label.startsWith("Vainqueur")) return shortName(label);
      if(mode==="admin"){
        const resolved=resolveTeam(label);
        return resolved?shortName(resolved):label.replace("Vainqueur ","?");
      } else {
        // Mode prono: chercher le pronostic du joueur
        const refId=label.replace("Vainqueur ","");
        const pred=elimPredictions[activePlayer]?.[refId]||{};
        return pred.winner?shortName(pred.winner):(elimActual[refId]?.winner?shortName(elimActual[refId].winner):"?");
      }
    };

    const getWinner=(matchId, mode)=>{
      if(mode==="admin"){
        return elimActual[matchId]?.winner||null;
      } else {
        // Si le résultat officiel est connu, on l'utilise
        if(elimActual[matchId]?.winner) return elimActual[matchId].winner;
        // Sinon le pronostic du joueur
        return elimPredictions[activePlayer]?.[matchId]?.winner||null;
      }
    };

    const getWinnerShort=(matchId, mode)=>{
      const w=getWinner(matchId, mode);
      return w?shortName(w):null;
    };

    // Structure du bracket : paires de 16es → 8e → QF → SF → F
    // Côté gauche: M01-M08 → M17-M20 → M25-M26 → M29 → M31
    // Côté droit:  M09-M16 → M21-M24 → M27-M28 → M30 → M31

    const matchColor=(matchId)=>{
      const act=elimActual[matchId]||{};
      if(!act.winner) return C.border;
      if(mode==="admin") return C.green;
      const pred=elimPredictions[activePlayer]?.[matchId]||{};
      if(!pred.winner) return C.border;
      return pred.winner===act.winner?C.green:C.red;
    };

    const MatchBox=({matchId, label, showId=true})=>{
      const r16=ELIM_ROUNDS[0];
      const match=ELIM_ROUNDS.flatMap(r=>r.matches).find(m=>m.id===matchId);
      const phase=ELIM_ROUNDS.find(r=>r.matches.some(m=>m.id===matchId))?.id||"R16";
      const act=elimActual[matchId]||{};
      const pred=mode==="prono"?(elimPredictions[activePlayer]?.[matchId]||{}):null;
      const winner=getWinner(matchId, mode);
      const isKnown=!!act.winner;

      // Équipes à afficher
      let team1, team2;
      if(match){
        team1=getDisplayName(match.home, mode);
        team2=getDisplayName(match.away, mode);
      } else {
        team1="?"; team2="?";
      }

      const isWinner1=winner&&match&&(winner===(resolveTeam(match.home)||match.home));
      const isWinner2=winner&&match&&(winner===(resolveTeam(match.away)||match.away));
      const predWinner=pred?.winner;
      const isPred1=predWinner&&match&&predWinner.includes(team1.replace("?","").trim())&&team1!=="?";
      const isPred2=predWinner&&match&&predWinner.includes(team2.replace("?","").trim())&&team2!=="?";

      const bc=matchColor(matchId);

      return(
        <div style={{border:`1px solid ${bc}`,borderRadius:8,overflow:"hidden",minWidth:110,maxWidth:130,background:"#0a1628"}}>
          {showId&&<div style={{fontSize:9,color:C.muted,fontWeight:700,textAlign:"center",padding:"2px 4px",borderBottom:`1px solid ${C.border}`,background:"#0f172a"}}>{matchId} · {match?.date||""}</div>}
          {[{team:team1,isW:isWinner1,isPred:isPred1},{team:team2,isW:isWinner2,isPred:isPred2}].map(({team,isW,isPred},i)=>(
            <div key={i} style={{
              padding:"4px 8px",fontSize:11,fontWeight:isW?700:500,
              background:isW?(mode==="admin"?C.green+"22":isKnown&&isPred?C.green+"22":isKnown?C.red+"11":C.accent+"11"):"transparent",
              color:isW?(mode==="admin"?C.green:isKnown&&isPred?C.green:isKnown?C.red:pc):team==="?"?C.muted:C.text,
              borderBottom:i===0?`1px solid ${C.border}`:"none",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
            }}>
              {mode==="prono"&&isPred&&!isKnown&&<span style={{color:pc,marginRight:3}}>▶</span>}
              {team}
            </div>
          ))}
        </div>
      );
    };

    // Layout du bracket : 2 colonnes (gauche + droite) avec phases
    const leftR16=["M01","M02","M03","M04","M05","M06","M07","M08"];
    const rightR16=["M09","M10","M11","M12","M13","M14","M15","M16"];
    const leftR8=["M17","M18","M19","M20"];
    const rightR8=["M21","M22","M23","M24"];
    const leftQF=["M25","M26"];
    const rightQF=["M27","M28"];
    const leftSF=["M29"];
    const rightSF=["M30"];
    const finale=["M31"];

    const ColHeader=({label,pts})=>(
      <div style={{fontSize:10,fontWeight:700,color:C.accent,textAlign:"center",marginBottom:6,padding:"3px 6px",background:C.accent+"11",borderRadius:6,whiteSpace:"nowrap"}}>
        {label}<br/><span style={{color:C.gold,fontSize:9}}>{pts}</span>
      </div>
    );

    const MatchCol=({ids,showId=true})=>(
      <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
        {ids.map(id=><MatchBox key={id} matchId={id} showId={showId}/>)}
      </div>
    );

    return(
      <div style={{...S.card,padding:10,overflowX:"auto"}}>
        <div style={{fontSize:12,fontWeight:700,color:mode==="prono"?pc:C.purple,marginBottom:10}}>
          {mode==="prono"?`🏆 Tableau de ${activePlayer}`:"🏆 Tableau officiel"}
        </div>
        <div style={{display:"flex",gap:6,minWidth:700}}>
          {/* Côté gauche */}
          <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
            <div><ColHeader label="16es" pts="+2pts"/><MatchCol ids={leftR16}/></div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",height:"100%",gap:8,paddingTop:22}}>
              {leftR8.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",gap:8,paddingTop:22}}>
              {leftQF.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:8,paddingTop:22}}>
              {leftSF.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
          </div>

          {/* Finale centrale */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"0 4px"}}>
            <ColHeader label="Finale" pts="+6pts"/>
            {finale.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            <div style={{fontSize:16,marginTop:4}}>🏆</div>
          </div>

          {/* Côté droit */}
          <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:8,paddingTop:22}}>
              {rightSF.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",gap:8,paddingTop:22}}>
              {rightQF.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",gap:8,paddingTop:22}}>
              {rightR8.map(id=><MatchBox key={id} matchId={id} showId={true}/>)}
            </div>
            <div><ColHeader label="16es" pts="+2pts"/><MatchCol ids={rightR16}/></div>
          </div>
        </div>
        <div style={{marginTop:8,fontSize:10,color:C.muted}}>
          {mode==="prono"?"▶ = votre pronostic · 🟢 = correct · 🔴 = incorrect":"🟢 = vainqueur officiel"}
        </div>
      </div>
    );
  };

  // ── PRONOSTICS ÉLIM ───────────────────────────────────────────────────────
  const PronosElim=()=>{
    return(
      <div>
        <PlayerSelect/>
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
          {ELIM_ROUNDS.map(r=>(
            <button key={r.id} style={S.roundBtn(activeRound===r.id)} onClick={()=>dispatch({type:"SET_ROUND",round:r.id})}>{r.name}</button>
          ))}
        </div>

        {/* Bracket */}
        <BracketView mode="prono"/>

        {/* Meilleur buteur */}
        <div style={{...S.card,borderColor:locked?C.border:C.gold}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:C.gold}}>⚽ Meilleur buteur du tournoi</div>
          {locked?(
            <div>
              <div style={{fontSize:12,color:C.muted,marginBottom:6}}>Choix verrouillé depuis le 28 juin 21h</div>
              <div style={{fontSize:15,fontWeight:700,color:topScorer[activePlayer]?pc:C.muted}}>
                {topScorer[activePlayer]||"Pas de choix"}
                {officialTopScorer&&topScorer[activePlayer]===officialTopScorer&&<span style={{color:C.green,marginLeft:8}}>✓ +10 pts !</span>}
              </div>
            </div>
          ):(
            <div>
              <div style={{fontSize:11,color:C.gold,marginBottom:8}}>⏰ Verrouillage le 28 juin à 21h — choisissez avant !</div>
              <select value={topScorer[activePlayer]||""} onChange={e=>dispatch({type:"SET_TOP_SCORER",player:activePlayer,value:e.target.value})}
                style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${C.gold}`,background:"#0f172a",color:topScorer[activePlayer]?C.gold:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none"}}>
                <option value="">-- Choisir un joueur --</option>
                {TOP_SCORER_PLAYERS.map(p=><option key={p} value={p} style={{color:"#e2e8f0",background:"#132038"}}>{p}</option>)}
              </select>
              {topScorer[activePlayer]&&<div style={{marginTop:8,fontSize:12,color:C.gold}}>✓ Choix : <b>{topScorer[activePlayer]}</b></div>}
            </div>
          )}
        </div>

        {/* Matchs de la phase sélectionnée */}
        {curRound&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:C.accent}}>{curRound.name}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>
              {curRound.id==="R16"?"Vainqueur = +2 pts · Score exact TR = +1 bonus":
               curRound.id==="R8"?"Vainqueur = +3 pts · Score exact TR = +1 bonus":
               curRound.id==="QF"?"Vainqueur = +4 pts · Score exact TR = +1 bonus":
               curRound.id==="SF"?"Vainqueur = +5 pts · Score exact TR = +1 bonus":
               "Vainqueur = +6 pts · Score exact TR = +1 bonus"}
            </div>
            {curRound.matches.map(m=>{
              const pred=elimPredictions[activePlayer]?.[m.id]||{};
              const act=elimActual[m.id]||{};
              const isLocked=act.winner!==undefined&&act.winner!=="";
              const pts=isLocked?computeElimPoints(pred,act,curRound.id):null;
              // Résoudre les noms réels via elimActual
              const resolveTeam=(label)=>{
                if(!label.startsWith("Vainqueur")) return label;
                const refId=label.replace("Vainqueur ","");
                return elimActual[refId]?.winner||label;
              };
              const homeLabel=resolveTeam(m.home);
              const awayLabel=resolveTeam(m.away);
              const homeShort=shortName(homeLabel);
              const awayShort=shortName(awayLabel);
              const isPending=homeLabel.startsWith("Vainqueur")||awayLabel.startsWith("Vainqueur");
              return(
                <div key={m.id} style={{...S.matchRow,opacity:isPending?0.5:1}}>
                  <div style={{fontSize:10,color:C.muted,width:42,textAlign:"center",flexShrink:0}}>{m.date}</div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right",lineHeight:1.3,color:pred.winner===homeLabel&&!isPending?pc:C.text}}>{homeShort}</div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                    {/* Sélection vainqueur */}
                    {!isPending&&!isLocked&&(
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>dispatch({type:"SET_ELIM_PRED",player:activePlayer,matchId:m.id,field:"winner",value:homeLabel})}
                          style={{padding:"4px 8px",borderRadius:6,border:`2px solid ${pred.winner===homeLabel?pc:C.border}`,background:pred.winner===homeLabel?pc+"33":"transparent",color:pred.winner===homeLabel?pc:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          Ici
                        </button>
                        <button onClick={()=>dispatch({type:"SET_ELIM_PRED",player:activePlayer,matchId:m.id,field:"winner",value:awayLabel})}
                          style={{padding:"4px 8px",borderRadius:6,border:`2px solid ${pred.winner===awayLabel?pc:C.border}`,background:pred.winner===awayLabel?pc+"33":"transparent",color:pred.winner===awayLabel?pc:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          Ici
                        </button>
                      </div>
                    )}
                    {/* Score exact bonus */}
                    {!isPending&&pred.winner&&!isLocked&&(
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <ScoreInput small value={pred.homeScore} disabled={false} onChange={v=>dispatch({type:"SET_ELIM_PRED",player:activePlayer,matchId:m.id,field:"homeScore",value:v})}/>
                        <span style={{color:C.muted,fontSize:12,fontWeight:700}}>–</span>
                        <ScoreInput small value={pred.awayScore} disabled={false} onChange={v=>dispatch({type:"SET_ELIM_PRED",player:activePlayer,matchId:m.id,field:"awayScore",value:v})}/>
                      </div>
                    )}
                    {isLocked&&<div style={{fontSize:11,color:C.muted}}>Joué</div>}
                    {isPending&&<div style={{fontSize:10,color:C.muted,textAlign:"center"}}>En attente</div>}
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left",lineHeight:1.3,color:pred.winner===awayLabel&&!isPending?pc:C.text}}>{awayShort}</div>
                  <div style={{width:52,textAlign:"center",flexShrink:0}}><Badge pts={pts}/></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── RÉSULTATS (admin) ─────────────────────────────────────────────────────
  const Resultats=()=>{
    const isElimTab=activeRound!==null&&tab==="resultats";
    const oQuals=officialQuals[curGroup?.id]||[];
    return(
      <div>
        <div style={{...S.card,background:"#1a0f2e",borderColor:"#4c1d95",marginBottom:14}}>
          <div style={{fontSize:13,color:C.purple,fontWeight:600}}>✏️ Mode admin — Scores officiels</div>
        </div>

        {/* Tabs groupes / élim */}
        <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
          <button style={S.roundBtn(activeGroup!==null&&!["R16","R8","QF","SF","F"].includes(activeRound))} onClick={()=>dispatch({type:"SET_GROUP",group:activeGroup||"A"})}>Groupes</button>
          {ELIM_ROUNDS.map(r=>(
            <button key={r.id} style={S.roundBtn(activeRound===r.id&&["R16","R8","QF","SF","F"].includes(activeRound))} onClick={()=>dispatch({type:"SET_ROUND",round:r.id})}>{r.name.replace(" de finale","")}</button>
          ))}
        </div>

        {/* Bracket officiel */}
        <BracketView mode="admin"/>

        {/* Admin meilleur buteur */}
        <div style={{...S.card,borderColor:C.gold}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:C.gold}}>⚽ Meilleur buteur officiel</div>
          <select value={officialTopScorer||""} onChange={e=>dispatch({type:"SET_OFFICIAL_TOP_SCORER",value:e.target.value})}
            style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${C.gold}`,background:"#0f172a",color:officialTopScorer?C.gold:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none"}}>
            <option value="">-- Pas encore connu --</option>
            {TOP_SCORER_PLAYERS.map(p=><option key={p} value={p} style={{color:"#e2e8f0",background:"#132038"}}>{p}</option>)}
          </select>
          {officialTopScorer&&<div style={{marginTop:6,fontSize:12,color:C.gold}}>✓ Officiel : <b>{officialTopScorer}</b></div>}
        </div>

        {/* Résultats groupes */}
        {(!["R16","R8","QF","SF","F"].includes(activeRound))&&curGroup&&(
          <>
            <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
              {GROUPS.map(g=>(
                <button key={g.id} style={S.groupBtn(activeGroup===g.id)} onClick={()=>dispatch({type:"SET_GROUP",group:g.id})}>{g.id}</button>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.accent}}>{curGroup.name}</div>
              {curGroup.matches.map(m=>{
                const isFixed=!!PLAYED[m.id];
                const act=actual[m.id]||{};
                return(
                  <div key={m.id} style={S.matchRow}>
                    <div style={{fontSize:10,color:C.muted,width:38,flexShrink:0,textAlign:"center"}}>{m.date}</div>
                    <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right"}}>{shortName(m.home)}</div>
                    <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <ScoreInput small value={isFixed?PLAYED[m.id].home:act.home??""} disabled={isFixed} onChange={v=>dispatch({type:"SET_ACTUAL",matchId:m.id,side:"home",value:parseInt(v)})}/>
                      <span style={{color:C.muted,fontWeight:700}}>–</span>
                      <ScoreInput small value={isFixed?PLAYED[m.id].away:act.away??""} disabled={isFixed} onChange={v=>dispatch({type:"SET_ACTUAL",matchId:m.id,side:"away",value:parseInt(v)})}/>
                    </div>
                    <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left"}}>{shortName(m.away)}</div>
                    <div style={{width:40,textAlign:"center"}}>{isFixed&&<span style={{fontSize:10,color:C.green}}>✓</span>}</div>
                  </div>
                );
              })}
              <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,color:C.purple,marginBottom:8,fontWeight:600}}>✅ Qualifiés officiels — 1er clic = 1er · 2e clic = 2e</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {curGroup.teams.map(team=>{
                    const rank=oQuals.indexOf(team)!==-1?oQuals.indexOf(team)+1:null;
                    return <QualBtn key={team} team={team} rank={rank} isOfficial={!!rank} playerColor={C.green} onClick={()=>dispatch({type:"TOGGLE_OFFICIAL_QUAL",groupId:curGroup.id,team})}/>;
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Résultats élim */}
        {["R16","R8","QF","SF","F"].includes(activeRound)&&curRound&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.accent}}>{curRound.name} — Résultats officiels</div>
            {curRound.matches.map(m=>{
              const act=elimActual[m.id]||{};
              const resolveTeam=(label)=>{
                if(!label.startsWith("Vainqueur")) return label;
                const refId=label.replace("Vainqueur ","");
                return elimActual[refId]?.winner||label;
              };
              const homeLabel=resolveTeam(m.home);
              const awayLabel=resolveTeam(m.away);
              const isPending=homeLabel.startsWith("Vainqueur")||awayLabel.startsWith("Vainqueur");
              return(
                <div key={m.id} style={{...S.matchRow,opacity:isPending?0.4:1}}>
                  <div style={{fontSize:10,color:C.muted,width:42,flexShrink:0,textAlign:"center"}}>{m.date}</div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"right"}}>{shortName(homeLabel)}</div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                    {!isPending&&(
                      <>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>dispatch({type:"SET_ELIM_ACTUAL",matchId:m.id,field:"winner",value:homeLabel})}
                            style={{padding:"4px 8px",borderRadius:6,border:`2px solid ${act.winner===homeLabel?C.green:C.border}`,background:act.winner===homeLabel?C.green+"33":"transparent",color:act.winner===homeLabel?C.green:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>✓</button>
                          <button onClick={()=>dispatch({type:"SET_ELIM_ACTUAL",matchId:m.id,field:"winner",value:awayLabel})}
                            style={{padding:"4px 8px",borderRadius:6,border:`2px solid ${act.winner===awayLabel?C.green:C.border}`,background:act.winner===awayLabel?C.green+"33":"transparent",color:act.winner===awayLabel?C.green:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>✓</button>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:3}}>
                          <ScoreInput small value={act.homeScore??""} disabled={false} onChange={v=>dispatch({type:"SET_ELIM_ACTUAL",matchId:m.id,field:"homeScore",value:parseInt(v)})}/>
                          <span style={{color:C.muted,fontSize:12}}>–</span>
                          <ScoreInput small value={act.awayScore??""} disabled={false} onChange={v=>dispatch({type:"SET_ELIM_ACTUAL",matchId:m.id,field:"awayScore",value:parseInt(v)})}/>
                        </div>
                      </>
                    )}
                    {isPending&&<span style={{fontSize:10,color:C.muted}}>En attente</span>}
                  </div>
                  <div style={{flex:1,fontSize:12,fontWeight:600,textAlign:"left"}}>{shortName(awayLabel)}</div>
                  <div style={{width:40,textAlign:"center"}}>{act.winner&&<span style={{fontSize:10,color:C.green}}>✓</span>}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparatif joueurs sur le round élim */}
        {["R16","R8","QF","SF","F"].includes(activeRound)&&curRound&&(
          <div style={S.card}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:C.muted}}>Comparatif — {curRound.name}</div>
            {curRound.matches.map(m=>{
              const act=elimActual[m.id]||{};
              const resolveTeam=(label)=>{
                if(!label.startsWith("Vainqueur")) return label;
                const refId=label.replace("Vainqueur ","");
                return elimActual[refId]?.winner||label;
              };
              const homeLabel=resolveTeam(m.home);
              const awayLabel=resolveTeam(m.away);
              const isPending=homeLabel.startsWith("Vainqueur")||awayLabel.startsWith("Vainqueur");
              if(isPending) return null;
              return(
                <div key={m.id} style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6}}>
                    {shortName(homeLabel)} vs {shortName(awayLabel)} · {m.date}
                    {act.winner&&<span style={{color:C.green,marginLeft:8}}>→ {shortName(act.winner)}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {PLAYERS.map(p=>{
                      const pred=elimPredictions[p]?.[m.id]||{};
                      const pts=act.winner?computeElimPoints(pred,act,curRound.id):null;
                      return(
                        <div key={p} style={{background:"#0f172a",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${pts>=3?C.green:pts>=2?C.gold:pts===0&&pts!==null?C.red:C.border}`,minWidth:70}}>
                          <div style={{fontSize:10,color:getPlayerColor(p),fontWeight:700,marginBottom:3}}>{p}</div>
                          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{pred.winner?shortName(pred.winner):"—"}</div>
                          {pred.homeScore!==undefined&&pred.homeScore!==""&&<div style={{fontSize:10,color:C.muted}}>{pred.homeScore}-{pred.awayScore}</div>}
                          {pts!==null&&<div style={{marginTop:4}}><Badge pts={pts}/></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── CLASSEMENT ────────────────────────────────────────────────────────────
  const Classement=()=>(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:10}}>Classement général</div>
        {sorted.map((p,i)=>(
          <div key={p} style={{...S.card,display:"flex",alignItems:"center",gap:12,borderColor:i===0?C.gold:C.border,marginBottom:8}}>
            <div style={{fontSize:20,width:30,textAlign:"center"}}>{i===0?"🏆":i===1?"🥈":i===2?"🥉":`${i+1}.`}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16,color:getPlayerColor(p)}}>{p}</div>
              <div style={{color:C.muted,fontSize:10,marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                <span>Matchs <b style={{color:C.accent}}>{bk[p].gPts}</b></span>
                <span>Qualifiés <b style={{color:C.green}}>{bk[p].qPts}</b></span>
                <span>Bonus ordre <b style={{color:C.gold}}>{bk[p].bPts}</b></span>
                <span>Élim. <b style={{color:C.purple}}>{bk[p].ePts}</b></span>
                {bk[p].tsPts>0&&<span>Buteur <b style={{color:C.gold}}>+10</b></span>}
              </div>
            </div>
            <div style={{fontSize:28,fontWeight:900,color:getPlayerColor(p)}}>{totals[p]}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> pts</span></div>
          </div>
        ))}
      </div>

      {/* Meilleur buteur recap */}
      <div style={{...S.card,borderColor:C.gold}}>
        <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:8}}>⚽ MEILLEUR BUTEUR — Récap</div>
        {officialTopScorer&&<div style={{fontSize:12,color:C.green,marginBottom:8}}>Officiel : <b>{officialTopScorer}</b></div>}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {PLAYERS.map(p=>(
            <div key={p} style={{background:"#0f172a",borderRadius:8,padding:"6px 10px",border:`1px solid ${topScorer[p]===officialTopScorer&&officialTopScorer?C.gold:C.border}`}}>
              <div style={{fontSize:10,color:getPlayerColor(p),fontWeight:700}}>{p}</div>
              <div style={{fontSize:11,color:topScorer[p]===officialTopScorer&&officialTopScorer?C.gold:C.muted}}>{topScorer[p]||"—"}{topScorer[p]===officialTopScorer&&officialTopScorer?" ⭐":""}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{...S.card,background:"#0a1628"}}>
        <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:8}}>📋 RÈGLES</div>
        {[
          ["✓",C.gold,"Bon résultat groupes","+1 pt"],
          ["🎯",C.green,"Score exact groupes","+2 pts"],
          ["🏅",C.green,"Qualifié trouvé","+1 pt/équipe"],
          ["⭐",C.gold,"Ordre exact 1er+2e","+2 pts bonus"],
          ["🏆",C.accent,"Vainqueur 16e","+ 2 pts"],
          ["🏆",C.accent,"Vainqueur 8e","+ 3 pts"],
          ["🏆",C.accent,"Vainqueur QF","+ 4 pts"],
          ["🏆",C.accent,"Vainqueur 1/2","+ 5 pts"],
          ["🏆",C.gold,"Vainqueur Finale","+ 6 pts"],
          ["🎯",C.purple,"Score exact TR (élim)","+1 bonus"],
          ["⚽",C.gold,"Meilleur buteur","+ 10 pts"],
        ].map(([ic,col,lb,pt])=>(
          <div key={lb} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,marginBottom:5}}>
            <span>{ic}</span><span style={{flex:1,color:C.text}}>{lb}</span><span style={{fontWeight:700,color:col}}>{pt}</span>
          </div>
        ))}
      </div>

      <div style={{marginTop:16}}>
        {!resetConfirm
          ?<button onClick={()=>setResetConfirm(true)} style={{background:"transparent",border:`1px solid ${C.red}`,color:C.red,borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>🗑️ Réinitialiser toutes les données</button>
          :<div style={{...S.card,borderColor:C.red,background:"#1a0a0a"}}>
            <div style={{fontSize:13,color:C.red,marginBottom:10,fontWeight:600}}>Confirmer ? Toutes les données seront effacées pour tout le monde.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{dispatch({type:"RESET"});setResetConfirm(false);}} style={{background:C.red,border:"none",color:"#fff",borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer",fontWeight:700}}>Oui, effacer</button>
              <button onClick={()=>setResetConfirm(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"10px 16px",fontSize:13,cursor:"pointer"}}>Annuler</button>
            </div>
          </div>
        }
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,sans-serif",paddingBottom:60}}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:900,margin:0,background:"linear-gradient(90deg,#22d3ee,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚽ Mondial 2026</h1>
            <p style={{color:C.muted,fontSize:11,margin:"2px 0 10px"}}>USA · Canada · Mexique</p>
          </div>
          <div style={{fontSize:11,color:syncColor,paddingTop:4}}>{syncIcon}</div>
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none"}}>
          {sorted.map((p,i)=>(
            <div key={p} style={{background:getPlayerColor(p)+"22",border:`1px solid ${getPlayerColor(p)}`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,color:getPlayerColor(p),whiteSpace:"nowrap",flexShrink:0}}>
              {i===0?"🏆":i===1?"🥈":i===2?"🥉":""} {p} · {totals[p]}
            </div>
          ))}
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginTop:4,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["prono_groupe","📝 Groupes"],["prono_elim","🏆 Élim."],["resultats","✅ Résultats"],["classement","🎖️ Classement"]].map(([id,lb])=>(
            <button key={id} style={S.tab(tab===id)} onClick={()=>dispatch({type:"SET_TAB",tab:id})}>{lb}</button>
          ))}
        </div>
      </div>
      <div style={S.body}>
        {tab==="prono_groupe"&&<PronosGroupes/>}
        {tab==="prono_elim"&&<PronosElim/>}
        {tab==="resultats"&&<Resultats/>}
        {tab==="classement"&&<Classement/>}
      </div>
    </div>
  );
}
