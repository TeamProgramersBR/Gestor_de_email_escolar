(function() {
  'use strict';
  angular.module('EMAILAPP').controller('TURMACTRL', function($scope,$banco,$stateParams, $state,toaster){
    //Variavel que recebe o curso.
    if($stateParams.curso != undefined)$scope.curso = $stateParams.curso;
    console.log($stateParams.curso);
    if($stateParams.curso != undefined)$scope.turma = $stateParams.turma;
    if ($state.current.name == "turmaui")$scope.cadastro = $stateParams.turma;
    $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };
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
      $banco.save(temp).then(function () {
        toaster.pop({type: 'success',title: 'Emails salvos com sucesso',body: 'Os emails foram atribuidos a turma',showCloseButton: true,timeout: 13000});
      });
    }
    // remove email da lista
    $scope.removeremail = function (pessoa) {
      if (confirm("Tem certeza que deseja remover?")) {
        for(var i = $scope.turmadados.emails.length; i--;) {
          if($scope.turmadados.emails[i] === pessoa) {
            $scope.turmadados.emails.splice(i, 1);
          }
        }
        toaster.pop({type: 'success',title: 'email removido com sucesso',body: 'O email foi removido com sucesso.',showCloseButton: true,timeout: 13000});
      }
    }
    //Salva e realiza update.
    $scope.salvar = function (cadastro,cursoID) {
      cadastro.tipo = "turma";
      cadastro.curso = cursoID;
      $banco.save(cadastro);
      if (cadastro._id == undefined) {
        toaster.pop({type: 'success',title: 'Turma salva com sucesso',body: 'A inserção da turma ocorreu de forma esperada.',showCloseButton: true,timeout: 13000});
      }else{
        toaster.pop({type: 'success',title: 'Turma editada com sucesso',body: 'A edição da turma ocorreu de forma esperada.',showCloseButton: true,timeout: 13000});
      }
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
