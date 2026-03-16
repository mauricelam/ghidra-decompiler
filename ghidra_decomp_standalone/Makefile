# Standalone Makefile for Ghidra Decompiler

# Standard C++ compiler
CXX=g++ -std=c++11

# OS and architecture detection
OS = $(shell uname -s)
CPU = $(shell uname -m)

ifeq ($(OS),Linux)
  ifndef ARCH
    ARCH=$(CPU)
  endif
  ifeq ($(ARCH),x86_64)
    ARCH_TYPE=-m64
  else
    ARCH_TYPE=-m32
  endif
endif

ifeq ($(OS),Darwin)
  ARCH_TYPE=-arch x86_64
  ADDITIONAL_FLAGS=-mmacosx-version-min=10.6 -w
endif

# Optimization flags
OPT_CXXFLAGS=-O2 -Wall -Wno-sign-compare

# No BFD library for standalone
BFDLIB=
INCLUDES=
LNK=-lz

# Source files categories
CORE=	xml marshal space float address pcoderaw translate opcodes globalcontext
DECCORE=capability architecture options graph cover block cast typeop database cpool \
	comment stringmanage modelrules fspec action loadimage grammar varnode op type \
	variable varmap jumptable emulate emulateutil flow userop expression multiprecision \
	funcdata funcdata_block funcdata_op funcdata_varnode unionresolve pcodeinject \
	heritage prefersplit rangeutil ruleaction subflow blockaction merge double \
	transform constseq bitfield coreaction condexe override dynamic crc32 prettyprint \
	printlanguage printc printjava memstate opbehavior paramid signature
SLEIGH=	sleigh pcodeparse pcodecompile sleighbase slghsymbol \
	slghpatexpress slghpattern semantics context slaformat compression filemanage
GHIDRA=	ghidra_arch inject_ghidra ghidra_translate loadimage_ghidra \
	typegrp_ghidra database_ghidra ghidra_context cpool_ghidra \
	ghidra_process comment_ghidra string_ghidra signature_ghidra
SLACOMP=slgh_compile slghparse slghscan

# These are the ones that were in EXTRA but we removed BFD ones
EXTRA=callgraph ifacedecomp ifaceterm interface loadimage_xml raw_arch testfunction unify unionresolve xml_arch codedata

# Standalone decompiler executable and library
LIBDECOMP_NAMES=$(CORE) $(DECCORE) $(EXTRA) $(SLEIGH) libdecomp
COMMANDLINE_NAMES=$(LIBDECOMP_NAMES) consolemain

# Object files
COMMANDLINE_OPT_OBJS=$(COMMANDLINE_NAMES:%=com_opt/%.o)
LIBDECOMP_OPT_OBJS=$(LIBDECOMP_NAMES:%=com_opt/%.o)

all: decomp_opt libdecomp.a

com_opt/%.o:	%.cc
	mkdir -p com_opt
	$(CXX) $(ARCH_TYPE) -c $(OPT_CXXFLAGS) $(ADDITIONAL_FLAGS) $< -o $@

# Pre-generated parser files (we touch them to avoid needing bison/flex)
grammar.cc xml.cc pcodeparse.cc slghparse.cc slghscan.cc:
	touch $@

decomp_opt: $(COMMANDLINE_OPT_OBJS)
	$(CXX) $(OPT_CXXFLAGS) $(ARCH_TYPE) -o decomp_opt $(COMMANDLINE_OPT_OBJS) $(LNK)

libdecomp.a: $(LIBDECOMP_OPT_OBJS)
	rm -f libdecomp.a
	ar qc libdecomp.a $(LIBDECOMP_OPT_OBJS)
	ranlib libdecomp.a

clean:
	rm -rf com_opt decomp_opt libdecomp.a
