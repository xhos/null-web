{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    git-hooks,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      formatter = pkgs.alejandra;

      checks = {
        pre-commit = git-hooks.lib.${system}.run {
          src = ./.;
          hooks.alejandra.enable = true;
        };
      };

      devShells = {
        default = pkgs.mkShell {
          packages = with pkgs; [
            buf
            nodejs
            typescript
            bun

            (writeShellScriptBin "regen" ''
              rm -rf src/gen/
              bun buf generate
            '')

            (writeShellScriptBin "run" ''
              bun run dev
            '')

            (writeShellScriptBin "bump-protos" ''
              git submodule update --remote proto
              git add proto
              git commit -m "chore: bump protos"
              git push
            '')
          ];

          shellHook = self.checks.${system}.pre-commit.shellHook;
        };
      };
    });
}
