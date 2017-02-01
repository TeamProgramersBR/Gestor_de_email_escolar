(function() {
  'use strict';
  var app = angular.module('gestorDeEmail');
  // Inicio do controller
  app.controller('turma' ,function ($scope, $database ,$stateParams,$state, $rootScope){
    // Configurações da tabela
    $scope.query = {
      limit: 2,
      page: 1
    };
    // Variaveis.
    $scope.listaTurmas = [];
    $scope.curso = $stateParams.curso;
    $scope.cadastro = {};
    $scope.cadastro.emails = [];
    // Traz todos os documentos do banco e os separa de acordo com a nescessiada.
    listarTudo();
    function listarTudo() {
      $scope.listaTurmas = [];
      $database.allDocs().then(function (docs) {
        angular.forEach(docs.rows, function (value) {
          if(value.doc.tipo == "turma" && value.doc.cursoID == $scope.curso._id) $scope.listaTurmas.push(value.doc);
        });
        $scope.$apply();
      });
    }
    console.log($scope.listaTurmas);
    // Caso tenha uma turma na url
    if ($stateParams.turma != null) {
      $scope.cadastro = $stateParams.turma;
      $scope.turma = angular.copy($scope.cadastro.codigo);
    }
    // Adiciona email a turma.
    $scope.adicionaremail = function (email) {
      console.log(email);
      if (email == undefined || email.nome == undefined || email.endereco == undefined) {
        bootbox.alert("Faltou preencher o nome ou ou endereço de email ou o email está no formato incorreto.");
      }else {
        var adicionar = true;
        angular.forEach($scope.cadastro.emails, function (value) {
          if(value.endereco == email.endereco){
            adicionar = false;
            bootbox.alert("Endereço de email duplicado");
          };
        });
        if (adicionar) {
          $scope.cadastro.emails.push(angular.copy(email));
          $scope.email = {};
        }

      }
    }
    // Remover endereço de email.
    $scope.removerEmail = function (email) {
      bootbox.confirm({
        message: "Tem certeza que deseja remover o email de ["+email.nome+"] "+email.endereco+ "?",
        buttons: {
          confirm: {
            label: 'Sim',
            className: 'btn-success'
          },
          cancel: {
            label: 'Cancelar',
            className: 'btn-danger'
          }
        },
        callback: function (result) {
          if (result) {
            var temp = [];
            angular.forEach($scope.cadastro.emails, function (e) {
              if(e.nome != email.nome && e.endereco != email.endereco) temp.push(e);
            });
            $scope.cadastro.emails = temp;
          };
          $scope.$apply();
        }
      });
    }
    // Salva a turma.
    $scope.salvar = function (documento) {
      if (documento.codigo == undefined || documento.datainicio == undefined || documento.dataconclusao == undefined || documento.turno == undefined) {
        bootbox.alert("Falta informações no cadastro da turma.");
      }else if (documento.codigo == "" || documento.datainicio == "" || documento.dataconclusao == "" || documento.turno == "") {
        bootbox.alert("Falta informações no cadastro da turma.");
      }else{
        documento.tipo = "turma";
        if (documento.dataCriacao == undefined) {
          documento.dataCriacao = new Date();
        }
        if (documento.emails == undefined) {
          documento.emails = [];
        }
        documento.cursoID = $scope.curso._id;
        var dialog = bootbox.dialog({
          message: '<p class="text-center">Aguarde enquanto o curso é salvo.</p>',
          closeButton: false
        });
        $database.save(documento).then(function (doc) {
          if ($scope.cadastro._id == undefined) {
            bootbox.alert("A turma foi salva com sucesso.");
          }else{
            bootbox.alert("A turma foi <b>Atualizada</b> com sucesso");
          }
          $scope.cadastro._id = doc.id;
          $scope.cadastro._rev = doc.rev;
          $scope.turma = angular.copy(documento.codigo);
          dialog.modal('hide');
        }).catch(function (error) {
          bootbox.alert("Ocorreu um erro ao salvar "+error);
          dialog.modal('hide');
        });
      }
    }
    // Deleta Turma
    $scope.deletar = function (documento) {
      bootbox.confirm({
        message: "Tem certeza que deseja a turma "+documento.codigo+" ?",
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
