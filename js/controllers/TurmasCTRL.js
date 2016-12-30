(function() {
  'use strict';
  angular.module('EMAILAPP').controller('TURMACTRL', function($scope,$banco,$stateParams){
    //Variavel que recebe o curso.
    if($stateParams.curso != undefined)$scope.curso = $stateParams.curso;
    if($stateParams.curso != undefined)$scope.turma = $stateParams.turma;
    // Voltar
    $scope.voltar = function () {
      window.history.back();
    }
    //Variavel que amarzenda emails
    $scope.emails = [];
    $scope.add = function (pessoa) {
      var temp = angular.copy(pessoa);
      $scope.emails.push(temp);
      $scope.cadastro.nome = "";
      $scope.cadastro.email = "";
    }
    // remove email da lista
    $scope.removeremail = function (pessoa) {
      for(var i = $scope.emails.length; i--;) {
         if($scope.emails[i] === pessoa) {
             $scope.emails.splice(i, 1);
         }
     }
    }
    //Salva e realiza update.
    $scope.salvar = function (cadastro,cursoID) {
      cadastro.tipo = "turma";
      cadastro.curso = cursoID;
      $banco.save(cadastro);
    }
    // traz todos as turmas
    $banco.all().then(function (turmas) {
      //refina o resultado
      var turmasExibir = [];
      angular.forEach(turmas.rows,function (turma) {
        if (turma.doc.tipo == "turma" && turma.doc.curso == $scope.curso._id) {
          turmasExibir.push(turma);
        }
        $scope.turmas = turmasExibir;
        $scope.$apply();
      });
    });

  });
})();
