(function() {
  'use strict';
  angular.module('EMAILAPP').controller('CURSOSCTRL', function($scope,$banco,$stateParams,toaster){
    // variavel de cadastro.
    if($stateParams.cadastro != undefined)$scope.cadastro = $stateParams.cadastro;
    // Voltar
    $scope.voltar = function () {
      window.history.back();
    }
    // Listagem de cursos
      $banco.all().then(function (retorno) {
        var temp = [];
        angular.forEach(retorno.rows, function (ret) {
          if (ret.doc.tipo == "curso") {
            temp.push(ret);
          }
        });
        $scope.cursos = temp;
        $scope.$apply();
      });


    // Salva e faz update de curso
    $scope.salvar = function (curso) {
      curso.tipo = "curso";
      if (curso._id != undefined) {
        toaster.pop({type: 'info',title: 'Sucesso',body: 'O curso foi editado com sucesso',showCloseButton: true});
      }else{
        toaster.pop({type: 'info',title: 'Sucesso',body: 'O curso foi criado com sucesso',showCloseButton: true});
      }
      $banco.save(curso);
    }

    });

})();
