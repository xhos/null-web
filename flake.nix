{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    git-hooks.url = "github:cachix/git-hooks.nix";
    git-hooks.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
    git-hooks,
  }: let
    forAllSystems = f:
      nixpkgs.lib.genAttrs
      ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"]
      (system: f nixpkgs.legacyPackages.${system});
  in {
    checks = forAllSystems (pkgs: {
      pre-commit = git-hooks.lib.${pkgs.system}.run {
        src = ./.;
        hooks = {
          alejandra.enable = true;
        };
      };
    });

    devShells = forAllSystems (pkgs: {
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
            git -C proto fetch origin
            git -C proto checkout main
            git -C proto pull --ff-only
            git add proto
            git commit -m "chore: bump proto files"
            git push
          '')
        ];

        shellHook = "${self.checks.${pkgs.system}.pre-commit.shellHook}";
      };
    });
  };
}
