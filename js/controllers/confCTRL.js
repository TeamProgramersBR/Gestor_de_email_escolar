(function() {
  'use strict';
  angular.module('EMAILAPP').controller('CONFIGCTRL', function($scope,$banco,$stateParams,toaster){
    // Configuração Controle;
    $scope.config = {"user":"","password":"","host":"","port":"","ssl":"","tls":"","timeout":"","domain":"","authentication":""};
    // Se configuração existir então e exibida na interface.
    $banco.all().then(function (documentos) {
      angular.forEach(documentos.rows, function (documento,key) {
        if (documento.doc.tipo == "configuração") {
          $scope.config = documento.doc;
          $('#assinatura').html(documento.doc.assinatura);
          $scope.$apply();
        }
      });
    });
    // Salva
    $scope.salvar = function (configuracao) {
      var temp = angular.copy(configuracao);
      temp.assinatura = $('#assinatura')[0].innerHTML;
      temp.tipo = "configuração";
      if (temp._id != undefined) {
        toaster.pop({type: 'info',title: 'Configurações salvas com sucesso',body: 'Configuração de envio de email foram salvas com sucesso',showCloseButton: true});
      }else{
        toaster.pop({type: 'success',title: 'Edição de configurações salvas com sucesso',body: 'A edição foi concluida',showCloseButton: true,timeout: 13000});
      }
      console.log(temp);
      $banco.save(temp);
    }

    $.trumbowyg.svgPath = 'node_modules/trumbowyg/dist/ui/icons.svg';
    $('#assinatura').trumbowyg({
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
