(function() {
  'use strict';
  angular.module('EMAILAPP').controller('EMAILCTRL', function($scope,$banco,$stateParams){
    $.trumbowyg.svgPath = 'node_modules/trumbowyg/dist/ui/icons.svg';
    $('#editorTexto').trumbowyg({
    btnsDef: {
        // Customizables dropdowns
        image: {
            dropdown: ['upload', 'base64', 'noEmbed'],
            ico: 'insertImage'
        }
    },
    btns: [
        ['viewHTML'],
        ['undo', 'redo'],
        ['formatting'],
        'btnGrp-design',
        ['link'],
        ['image'],
        'btnGrp-justify',
        'btnGrp-lists',
        ['foreColor', 'backColor'],
        ['preformatted'],
        ['horizontalRule'],
        ['fullscreen']
    ],
    plugins: {
        // Add imagur parameters to upload plugin
        upload: {
            serverPath: 'https://api.imgur.com/3/image',
            fileFieldName: 'image',
            headers: {
                'Authorization': 'Client-ID 9e57cb1c4791cea'
            },
            urlPropertyName: 'data.link'
        }
    }
});

  });
})();
