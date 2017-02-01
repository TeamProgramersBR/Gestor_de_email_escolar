(function() {
  'use strict';
  var app = angular.module('gestorDeEmail');
  // Inicio do controller
  app.controller('configuracoes' ,function ($scope, $database ,$stateParams,$state, $rootScope){
    // Variaveis
    $scope.configuracao = {};
    // Traz todos os documentos do banco e os separa de acordo com a nescessiada.

      $database.allDocs().then(function (docs) {
        console.log(docs);
        angular.forEach(docs.rows, function (value) {
          if(value.doc.tipo == "configuracoes" ){
            $scope.configuracao = value.doc;
            $('#assinatura').html($scope.configuracao.assinatura);
          };
        });
        if (localStorage.getItem("logado") == null && jQuery.isEmptyObject($scope.configuracao) == false) {
          $state.go('login');
        }
        if(jQuery.isEmptyObject($scope.configuracao)){
          bootbox.alert("Está e a primeira vez que você utiliza o software, configure-o com cuidado");
        }
        $scope.$apply();
      });
    



    // Salvar configuraçao
    $scope.salvar = function (documento) {
      documento.tipo = "configuracoes";
      documento.assinatura = $('#assinatura')[0].innerHTML;
      console.log(documento);
      if (documento.dataCriacao == undefined) {
        documento.dataCriacao = new Date();
      }
      if (documento.emails == undefined) {
        documento.emails = [];
      }
      var dialog = bootbox.dialog({
        message: '<p class="text-center">Aguarde enquanto o curso é salvo.</p>',
        closeButton: false
      });
      bootbox.confirm({
        message: "Salvar as configurações?",
        buttons: {
          confirm: {
            label: 'Sim',
            className: 'btn-success'
          },
          cancel: {
            label: 'Não',
            className: 'btn-danger'
          }
        },
        callback: function (result) {
          if (result) {
            $database.save(documento).then(function (doc) {
              $scope.configuracao._id = doc.id;
              $scope.configuracao._rev = doc.rev;
              dialog.modal('hide');
              if (localStorage.getItem("logado") == null) {
                  $state.go('login');
              }
            }).catch(function (error) {
              bootbox.alert("Ocorreu um erro ao salvar "+error);
            });
          }
        }
      });
      dialog.modal('hide');
    }
    // Configurações do editor html
    $.trumbowyg.svgPath = 'bower_components/trumbowyg/dist/ui/icons.svg';
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
