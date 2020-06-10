const dotenv = require('dotenv');
dotenv.config();

const List = require('./app/models/list');

const run = async () => {
  let lists = await List.findAll({
    include: [
      {association: 'cards', include: ['tags']}
    ]
  });

  //console.log(lists);

  lists.forEach( (list) => {
    let str = `La liste "${list.name}" contient les cartes : \n`;
    list.cards.forEach( (card) => {
      str += `\t- "${card.title}" avec les tags : `;
      card.tags.forEach( (tag) => {
        str += `"${tag.title}", `;
      });
      str += '\n';
    });
    console.log(str);
    
  });

};

run();