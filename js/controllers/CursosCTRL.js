(function() {
  'use strict';
  angular.module('EMAILAPP').controller('CURSOSCTRL', function($scope,$banco,$stateParams){
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
        console.log(temp);
        $scope.$apply();
      });


    // Salva e faz update de curso
    $scope.salvar = function (curso) {
      curso.tipo = "curso";
      $banco.save(curso);
    }

    });

})();
