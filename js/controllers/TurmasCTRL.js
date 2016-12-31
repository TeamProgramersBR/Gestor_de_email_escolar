(function() {
  'use strict';
  angular.module('EMAILAPP').controller('TURMACTRL', function($scope,$banco,$stateParams, $state){
    //Variavel que recebe o curso.
    if($stateParams.curso != undefined)$scope.curso = $stateParams.curso;
    if($stateParams.curso != undefined)$scope.turma = $stateParams.turma;
    // Voltar
    $scope.voltar = function () {
      window.history.back();
    }
    //Variavel que amarzenda emails
    $scope.turmadados = {};
    $scope.turmadados.emails = [];
    $scope.add = function (pessoa) {
      var temp = angular.copy(pessoa);
      $scope.turmadados.emails.push(temp);
      $scope.cadastro.nome = "";
      $scope.cadastro.email = "";
    }
    // Salva os emails
    $scope.salvarEmails = function () {
      var temp = {};
      temp = $scope.turmadados;
      temp.turmaID = $scope.turma._id;
      temp.cursoID = $scope.curso._id;
      temp.emails = $scope.turmadados.emails;
      temp.tipo = "emails";
      $banco.save(temp);
    }
    // remove email da lista
    $scope.removeremail = function (pessoa) {
      for(var i = $scope.turmadados.emails.length; i--;) {
        if($scope.turmadados.emails[i] === pessoa) {
          $scope.turmadados.emails.splice(i, 1);
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
      console.log(turmas);
      //refina o resultado
      var turmasExibir = [];
      angular.forEach(turmas.rows,function (turma) {
        if (turma.doc.tipo == "turma" && turma.doc.curso == $scope.curso._id) {
          turmasExibir.push(turma);
        }
        if (turma.doc.tipo == "emails" && $state.current.name == "emailsturma"){
          if (turma.doc.turmaID == $stateParams.turma._id){
            $scope.turmadados = turma.doc;
          }
        }
        $scope.turmas = turmasExibir;
        $scope.$apply();
      });
    });

  });
})();
