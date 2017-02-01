(function() {
  'use strict';
  var app = angular.module('gestorDeEmail');
  // Inicio do controller
  app.controller('curso' ,function ($scope, $database ,$stateParams,$state, $rootScope){
    // Variaveis.
    $scope.listaCursos = [];
    $scope.cadastro = {};
    // Traz todos os documentos do banco e os separa de acordo com a nescessiada.
    listarTudo();
    function listarTudo() {
      $scope.listaCursos = [];
      $database.allDocs().then(function (docs) {
        angular.forEach(docs.rows, function (value) {
          if(value.doc.tipo == "curso") $scope.listaCursos.push(value.doc);
        });
        angular.forEach($scope.listaCursos, function (curso) {
          curso.cont = 0;
          angular.forEach(docs.rows, function (value) {
            if(value.doc.tipo == "turma" && value.doc.cursoID == curso._id) curso.cont++;
          });
        });
        $scope.$apply();
      });
    }
    // Pega o curso para editar caso ele venha pela url.
    if ($stateParams.curso != null) {
      $scope.cadastro = $stateParams.curso;
    }
    // Salvar
    $scope.salvar = function (documento) {
      console.log(documento);
      documento.tipo = "curso";

      if (documento.dataCriacao == undefined) {
        documento.dataCriacao = new Date();
      }
      var dialog = bootbox.dialog({
        message: '<p class="text-center">Aguarde enquanto o curso é salvo.</p>',
        closeButton: false
      });
      $database.save(documento).then(function (doc) {
        $scope.cadastro._id = doc.id;
        $scope.cadastro._rev = doc.rev;
        $scope.curso = angular.copy(documento.nomeDoCurso);
        dialog.modal('hide');
      }).catch(function (error) {
        bootbox.alert("Ocorreu um erro ao salvar "+error);
        dialog.modal('hide');
      });
    }
    // Deleta curso
    $scope.deletar = function (documento) {
      bootbox.confirm({
        message: "Tem certeza que deseja deletar o curso "+documento.nomeDoCurso+" ?",
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
            $database.delete(documento._id, documento._rev).then(function (sucesso) {
              listarTudo();
              $scope.$apply();
            }).catch(function (err) {
              bootbox.alert("Houve um erro ao deletar "+err);
            });
          }
        }
      });
    }


  });

})();
