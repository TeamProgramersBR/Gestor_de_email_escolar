(function() {
  'use strict';
  angular.module('EMAILAPP').controller('EMAILCTRL', function($scope,$banco,$stateParams){
    // variavel que salva arquivos
    $scope.listaArquivos = [];
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
    // upload de arquivos
    $scope.upload = function () {
      $scope.listaArquivos.push({"nome":$scope.fileModel.name, "path": $scope.fileModel.path})
      $scope.fileModel = "";
    };
    // remove arquivos do envio
    $scope.removerArquivo = function (arquivo) {
      for(var i = $scope.listaArquivos.length; i--;) {
        if($scope.listaArquivos[i] === arquivo) {
          $scope.listaArquivos.splice(i, 1);
        }
      }
    }
    // Todos documentos
    $scope.turmas = [];
    $banco.all().then(function (documentos) {
      console.log(documentos);
      angular.forEach(documentos.rows, function (documento) {
        if(documento.doc.tipo == "curso") $scope.turmas.push(documento.doc);
        $scope.$apply();
      });
    });
    // Filtra turmas para pegar os emails
    $scope.aplicaFiltros = function () {
      var temp = [];
      $banco.all().then(function (documentos) {
        var temp = [];
        angular.forEach(documentos.rows, function (documento) {
          if(documento.doc.tipo == "turma"){
            for (var i = 0; i < $scope.turnosFilter.length; i++) {
              if(documento.doc.turno == $scope.turnosFilter[i].turno) temp.push(documento.doc);
            };
          };
        });
        ///
        var tempb = [];
        for (var i = 0; i < $scope.cursosFilter.length; i++) {
          tempb.push({"msGroup":true,"codigo":"<strong>"+$scope.cursosFilter[i].nome+"</strong>"})
          for (var j = 0; j < temp.length; j++) {
            if(temp[j].curso == $scope.cursosFilter[i]._id){
              var temporary = angular.copy(temp[j]);
              temporary.nomeDoCurso = $scope.cursosFilter[i].nome;
              tempb.push(temporary)
            };
          };
        };

        $scope.turmasAplicar = tempb;
        console.log(JSON.stringify(tempb));
        $scope.$apply();

        ///
      });
    }
  });
})();
